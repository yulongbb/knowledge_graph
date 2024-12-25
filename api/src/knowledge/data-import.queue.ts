import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Worker, Job } from 'bullmq';
import { KnowledgeService } from './knowledge.service';
import { EdgeService } from './edge.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { EsService } from './es.service';

@Injectable()
export class DataImportService implements OnModuleInit, OnApplicationShutdown {
    private worker: Worker;

    constructor(
        @InjectQueue('data-import-queue') private readonly queue: Queue,
        private readonly knowledgeService: KnowledgeService,
        private readonly propertiesService: PropertiesService,
        private readonly elasticsearchService: EsService,

        private readonly edgeService: EdgeService,
    ) { }

    async onModuleInit() {
        this.worker = new Worker(
            'data-import-queue',
            async (job: Job) => {

                // 这里是实际的数据导入逻辑
                await this.performImport(job);

                return { success: true };
            },
            { connection: this.queue.opts.connection }, // 使用队列的连接选项
        );

        // 监听事件，如完成、失败等
        this.worker.on('completed', (job) => {
        });

        this.worker.on('failed', (job, err) => {
        });
    }

    private async performImport(job: Job) {
        // 初始化进度为0
        job.updateProgress(0);

        try {
            const dataItems = job.data || [];
            const totalItems = dataItems.length;
            let completedItems = 0;

            for (const d of dataItems) {
                // 新增起始节点
                let from = await this.knowledgeService.addEntity(d); // 确保这是个异步操作
                Object.keys(d.claims).forEach(key => {
                    d.claims[key].forEach(async (statement: any) => {
                        // 新增目标节点
                        const target = {
                            type: { id: 'E4', name: '其他' },
                            labels: { zh: { language: 'zh', value: statement.mainsnak.datavalue.value } },
                            descriptions: {
                                zh: { language: 'zh', value: statement.mainsnak.datavalue.value },
                            },
                            aliases: { zh: [{ language: 'zh', value: statement.mainsnak.datavalue.value }] },
                        };

                        let prop = await this.propertiesService.getPropertyByName(statement.mainsnak.property);

                        if (!prop) {
                            prop = this.propertiesService.post({ schemas: [{ id: from.type }], name: statement.mainsnak.property, type: 'string' });
                        }

                        statement['mainsnak']['property'] = 'P' + prop?.id;

                        if (prop[0]?.type == 'wikibase-item') {
                            let to: any;
                            let knowledge: any = await this.elasticsearchService.query(
                                {
                                    "size": 1,
                                    "query": {
                                        "term": {
                                            "labels.zh.value.keyword": statement.mainsnak.datavalue.value
                                        }
                                    }
                                }
                            );
                            console.log(knowledge)

                            if (knowledge) {
                                to = knowledge;
                                statement['_to'] = to['_source']['items'][0];
                            } else {
                                to = await this.knowledgeService.addEntity(target); // 确保这是个异步操作
                                statement['_to'] = to['_id']
                            }
                            // 创建关系
                            statement['_from'] = from['_id']

                            statement.mainsnak.datatype = 'wikibase-item';
                            statement.mainsnak.datavalue.type = "wikibase-entityid"
                            statement.mainsnak.datavalue.value = {
                                "entity-type": "item",
                                "id": to['_key']
                            }
                        } else if (prop?.type == 'monolingualtext') {
                            // 创建关系
                            statement['_from'] = from['_id']
                            statement['_to'] = from['_id']
                            statement.mainsnak.datatype = 'monolingualtext';
                            statement.mainsnak.datavalue.type = "string"
                            statement.mainsnak.datavalue.value = statement.mainsnak.datavalue.value
                        } else {
                            // 创建关系
                            statement['_from'] = from['_id']
                            statement['_to'] = from['_id']
                            statement.mainsnak.datatype = 'string';
                            statement.mainsnak.datavalue.type = "string"
                            statement.mainsnak.datavalue.value = statement.mainsnak.datavalue.value
                        }


                        await this.edgeService.addEdge(statement); // 确保这是个异步操作
                    });
                });

                completedItems++;
                // 更新进度，假设每个数据项完成都增加相同的进度比例
                job.updateProgress(Math.round((completedItems / totalItems) * 100));
            }

            // 如果所有项目都成功处理，则设置进度为100%
            job.updateProgress(100);
        } catch (error) {
            console.error('Error during data import:', error);
            // 设置进度为-1表示任务失败
            job.updateProgress(-1);
            throw error; // 抛出错误以便 BullMQ 可以记录失败
        }
    }


    async addDataToQueue(data) {
        // 将数据作为任务添加到队列中
        return this.queue.add('data-import-job', data);
    }

    async onApplicationShutdown(signal?: string) {
        if (this.worker) {
            await this.worker.close();
        }
    }
}