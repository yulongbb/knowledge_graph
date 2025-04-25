import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Worker, Job } from 'bullmq';
import { KnowledgeService } from './knowledge.service';
import { EdgeService } from './edge.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { EsService } from './es.service';
import { Entity, Edge } from './models';
import axios from 'axios';  // Fixed import

/**
 * 属性信息接口
 */
interface PropertyInfo {
  id?: string | number;
  _key?: string;
  datatype?: string;
  schemas?: Array<{ id: string }>;
  name: string;
  type?: string;
  description?: string;
  enName?: string;
  enDescription?: string;
  group?: string;
}

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
    private async performImport(job: Job<Entity[]>) {
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
                if (d.claims) {
                    await Promise.all(
                        Object.keys(d.claims).map(async (key) => {
                            await Promise.all(
                                d.claims[key].map(async (statement: any) => {
                                    await this.processStatement(from, statement);
                                })
                            );
                        })
                    );
                }
                
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
     * 处理单个声明
     * @param from 源实体
     * @param statement 声明数据
     */
    private async processStatement(from: any, statement: any): Promise<void> {
        try {
            // 新增目标节点，默认类型为"其他"
            const target = {
                type: { id: 'E4', name: '其他' },
                labels: { 
                    zh: { 
                        language: 'zh', 
                        value: statement.mainsnak.datavalue.value 
                    }
                },
                descriptions: {
                    zh: { 
                        language: 'zh', 
                        value: statement.mainsnak.datavalue.value 
                    }
                },
                aliases: { 
                    zh: [{ 
                        language: 'zh', 
                        value: statement.mainsnak.datavalue.value 
                    }] 
                },
            };

            // 获取属性
            let prop = await this.propertiesService.getPropertyByName(statement.mainsnak.property);

            if (!prop) {
                prop = await this.createOrFetchProperty(statement.mainsnak.property, from.type);
            } else {
                // 如果属性存在，检查当前类型是否在 schemas 中
                await this.updatePropertySchema(prop, from.type);
            }

            // 更新语句中的属性ID
            statement.mainsnak.property = 'P' + prop?.id;

            // 根据属性类型处理不同的值类型
            await this.processPropertyValue(statement, from, target, prop);
            
            // 创建边关系 - using type assertion to any as intermediate step for compatibility
            await this.edgeService.addEdge(statement as any);
        } catch (error) {
            console.error('Error processing statement:', error);
        }
    }

    /**
     * 创建或获取属性
     */
    private async createOrFetchProperty(propertyName: string, entityType: any): Promise<PropertyInfo> {
        try {
            // 调用外部接口查询属性信息
            const url = `http://127.0.0.1:5555/property?name=${encodeURIComponent(propertyName)}`;
            const response = await axios.get(url);
    
            if (response.status === 200 && response.data && response.data._key && response.data.datatype) {
                // 如果外部接口返回有效数据，创建新属性
                const prop = await this.propertiesService.post({
                    schemas: [{ id: entityType }],
                    name: propertyName,
                    type: response.data.datatype
                });
                console.log('Property created from external API:', prop);
                return prop as PropertyInfo; // Added type casting
            } else {
                // 如果外部接口返回无效数据，创建默认属性
                const prop = await this.propertiesService.post({
                    schemas: [{ id: entityType }],
                    name: propertyName,
                    type: 'string'
                });
                console.log('Default property created:', prop);
                return prop as PropertyInfo; // Added type casting
            }
        } catch (error) {
            // 如果调用外部接口失败，创建默认属性
            console.error('Error calling external API:', error.message);
            const prop = await this.propertiesService.post({
                schemas: [{ id: entityType }],
                name: propertyName,
                type: 'string'
            });
            console.log('Default property created due to error:', prop);
            return prop as PropertyInfo; // Added type casting
        }
    }

    /**
     * 更新属性的模式关联
     */
    private async updatePropertySchema(prop: PropertyInfo, entityType: string): Promise<PropertyInfo> {
        const hasType = prop.schemas.some(schema => schema.id === entityType);
    
        if (!hasType) {
            // 如果当前类型不在 schemas 中，添加到 schemas 并更新属性
            prop.schemas.push({ id: entityType });
            const updatedProp = await this.propertiesService.put(prop as any); // Type casting to satisfy TS
            return updatedProp as PropertyInfo;
        }
        
        return prop;
    }

    /**
     * 处理属性值根据属性类型
     */
    private async processPropertyValue(statement: any, from: any, target: any, prop: PropertyInfo): Promise<void> {
        if (prop?.type == 'wikibase-item') {
            // 处理实体引用类型属性
            let to: any;
            // 查询是否已存在同名实体
            let knowledge: any = await this.elasticsearchService.query({
                "size": 1,
                "query": {
                    "term": {
                        "labels.zh.value.keyword": statement.mainsnak.datavalue.value
                    }
                }
            });
            console.log(knowledge);

            if (knowledge) {
                // 如果存在，使用现有实体
                to = knowledge;
                statement._to = to._source.items[0];
            } else {
                // 否则创建新实体
                to = await this.knowledgeService.addEntity(target); 
                statement._to = to._id;
            }
            
            // 设置关系的源实体
            statement._from = from._id;

            // 设置数据类型和值格式
            statement.mainsnak.datatype = 'wikibase-item';
            statement.mainsnak.datavalue.type = "wikibase-entityid";
            statement.mainsnak.datavalue.value = {
                "entity-type": "item",
                "id": to._key,
                "label": statement.mainsnak.datavalue.value // Preserve the label
            };
        } else if (prop?.type == 'quantity') {
            // 处理数量类型属性
            statement._from = from._id;
            statement._to = from._id;
            statement.mainsnak.datatype = 'quantity';
            statement.mainsnak.datavalue.type = "quantity";
            statement.mainsnak.datavalue.value = {
                "amount": statement.mainsnak.datavalue.value,
                "unit": "1"
            };
        } else if (prop?.type == 'monolingualtext') {
            // 处理单语言文本类型属性
            statement._from = from._id;
            statement._to = from._id;
            statement.mainsnak.datatype = 'monolingualtext';
            statement.mainsnak.datavalue.type = "string";
            statement.mainsnak.datavalue.value = statement.mainsnak.datavalue.value;
        } else {
            // 处理字符串类型属性
            statement._from = from._id;
            statement._to = from._id;
            statement.mainsnak.datatype = 'string';
            statement.mainsnak.datavalue.type = "string";
            statement.mainsnak.datavalue.value = statement.mainsnak.datavalue.value;
        }
    }

    /**
     * 添加数据导入任务到队列
     * @param data 要导入的数据
     * @returns 创建的队列任务
     */
    async addDataToQueue(data: Entity[]) {
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