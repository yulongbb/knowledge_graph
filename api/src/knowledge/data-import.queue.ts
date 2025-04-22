import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Worker, Job } from 'bullmq';
import { KnowledgeService } from './knowledge.service';
import { EdgeService } from './edge.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { EsService } from './es.service';
const axios = require('axios');

/**
 * 数据导入服务
 * 负责处理大批量数据的异步导入，通过队列方式管理导入任务
 */
@Injectable()
export class DataImportService implements OnModuleInit, OnApplicationShutdown {
    private worker: Worker; // 队列工作者

    constructor(
        @InjectQueue('data-import-queue') private readonly queue: Queue, // 注入队列
        private readonly knowledgeService: KnowledgeService, // 知识服务，用于处理实体
        private readonly propertiesService: PropertiesService, // 属性服务，用于处理属性
        private readonly elasticsearchService: EsService, // ES服务，用于搜索
        private readonly edgeService: EdgeService, // 边服务，用于处理实体间关系
    ) { }

    /**
     * 模块初始化时创建工作者
     */
    async onModuleInit() {
        this.worker = new Worker(
            'data-import-queue',
            async (job: Job) => {
                // 执行实际的数据导入逻辑
                await this.performImport(job);
                return { success: true };
            },
            { connection: this.queue.opts.connection }, // 使用队列的连接选项
        );

        // 监听工作者完成事件
        this.worker.on('completed', (job) => {
            console.log(`任务 ${job.id} 已完成`);
        });

        // 监听工作者失败事件
        this.worker.on('failed', (job, err) => {
            console.error(`任务 ${job.id} 失败:`, err);
        });
    }

    /**
     * 执行数据导入处理
     * @param job 队列任务
     */
    private async performImport(job: Job) {
        // 初始化进度为0
        job.updateProgress(0);

        try {
            const dataItems = job.data || [];
            const totalItems = dataItems.length;
            let completedItems = 0;

            for (const d of dataItems) {
                // 新增起始节点实体
                let from = await this.knowledgeService.addEntity(d); 
                
                // 处理实体的所有声明(claims)
                Object.keys(d.claims).forEach(key => {
                    d.claims[key].forEach(async (statement: any) => {
                        // 新增目标节点，默认类型为"其他"
                        const target = {
                            type: { id: 'E4', name: '其他' },
                            labels: { zh: { language: 'zh', value: statement.mainsnak.datavalue.value } },
                            descriptions: {
                                zh: { language: 'zh', value: statement.mainsnak.datavalue.value },
                            },
                            aliases: { zh: [{ language: 'zh', value: statement.mainsnak.datavalue.value }] },
                        };

                        // 获取属性
                        let prop = await this.propertiesService.getPropertyByName(statement.mainsnak.property);

                        if (!prop) {
                            try {
                                // 调用外部接口查询属性信息
                                const url = `http://127.0.0.1:5555/property?name=${encodeURIComponent(statement.mainsnak.property)}`;
                                const response = await axios.get(url);
                    
                                if (response.status === 200 && response.data && response.data._key && response.data.datatype) {
                                    // 如果外部接口返回有效数据，创建新属性
                                    prop = await this.propertiesService.post({
                                        schemas: [{ id: from.type }],
                                        name: statement.mainsnak.property,
                                        type: response.data.datatype
                                    });
                                    console.log('Property created from external API:', prop);
                                } else {
                                    // 如果外部接口返回无效数据，创建默认属性
                                    prop = await this.propertiesService.post({
                                        schemas: [{ id: from.type }],
                                        name: statement.mainsnak.property,
                                        type: 'string'
                                    });
                                    console.log('Default property created:', prop);
                                }
                            } catch (error) {
                                // 如果调用外部接口失败，创建默认属性
                                console.error('Error calling external API:', error.message);
                                prop = await this.propertiesService.post({
                                    schemas: [{ id: from.type }],
                                    name: statement.mainsnak.property,
                                    type: 'string'
                                });
                                console.log('Default property created due to error:', prop);
                            }
                        } else {
                            // 如果属性存在，检查当前类型是否在 schemas 中
                            const hasType = prop.schemas.some(schema => schema.id === from.type);
                    
                            if (!hasType) {
                                // 如果当前类型不在 schemas 中，添加到 schemas 并更新属性
                                prop.schemas.push({ id: from.type });
                                prop = await this.propertiesService.put(prop);
                                console.log('Property updated with new schema:', prop);
                            }
                        }

                        // 更新语句中的属性ID
                        statement['mainsnak']['property'] = 'P' + prop?.id;

                        // 根据属性类型处理不同的值类型
                        if (prop?.type == 'wikibase-item') {
                            // 处理实体引用类型属性
                            let to: any;
                            // 查询是否已存在同名实体
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
                                // 如果存在，使用现有实体
                                to = knowledge;
                                statement['_to'] = to['_source']['items'][0];
                            } else {
                                // 否则创建新实体
                                to = await this.knowledgeService.addEntity(target); 
                                statement['_to'] = to['_id']
                            }
                            // 设置关系的源实体
                            statement['_from'] = from['_id']

                            // 设置数据类型和值格式
                            statement.mainsnak.datatype = 'wikibase-item';
                            statement.mainsnak.datavalue.type = "wikibase-entityid"
                            statement.mainsnak.datavalue.value = {
                                "entity-type": "item",
                                "id": to['_key']
                            }
                        } else if (prop?.type == 'quantity') {
                            // 处理数量类型属性
                            statement['_from'] = from['_id']
                            statement['_to'] = from['_id']
                            statement.mainsnak.datatype = 'quantity';
                            statement.mainsnak.datavalue.type = "quantity"
                            statement.mainsnak.datavalue.value = {
                                "amount": statement.mainsnak.datavalue.value,
                                "unit": "1"
                            }
                        } else if (prop?.type == 'monolingualtext') {
                            // 处理单语言文本类型属性
                            statement['_from'] = from['_id']
                            statement['_to'] = from['_id']
                            statement.mainsnak.datatype = 'monolingualtext';
                            statement.mainsnak.datavalue.type = "string"
                            statement.mainsnak.datavalue.value = statement.mainsnak.datavalue.value
                        } else {
                            // 处理字符串类型属性
                            statement['_from'] = from['_id']
                            statement['_to'] = from['_id']
                            statement.mainsnak.datatype = 'string';
                            statement.mainsnak.datavalue.type = "string"
                            statement.mainsnak.datavalue.value = statement.mainsnak.datavalue.value
                        }
                        
                        // 创建边关系
                        await this.edgeService.addEdge(statement); 
                    });
                });
                
                // 更新进度
                completedItems++;
                job.updateProgress(Math.round((completedItems / totalItems) * 100));
            }
            
            // 所有项目处理完成，设置进度为100%
            job.updateProgress(100);
        } catch (error) {
            console.error('Error during data import:', error);
            // 设置进度为-1表示任务失败
            job.updateProgress(-1);
            throw error; // 抛出错误以便 BullMQ 可以记录失败
        }
    }

    /**
     * 添加数据导入任务到队列
     * @param data 要导入的数据
     * @returns 创建的队列任务
     */
    async addDataToQueue(data) {
        // 将数据作为任务添加到队列中
        return this.queue.add('data-import-job', data);
    }

    /**
     * 应用关闭时清理资源
     */
    async onApplicationShutdown(signal?: string) {
        if (this.worker) {
            await this.worker.close();
        }
    }
}