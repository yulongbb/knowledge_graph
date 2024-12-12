import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Worker, Job } from 'bullmq';
import { KnowledgeService } from './knowledge.service';
import { SchemasService } from 'src/ontology/services/schemas.service';

@Injectable()
export class DataImportService implements OnModuleInit, OnApplicationShutdown {
  private worker: Worker;

  constructor(
    @InjectQueue('data-import-queue') private readonly queue: Queue,
    private readonly knowledgeService: KnowledgeService,
) {}

  async onModuleInit() {
    this.worker = new Worker(
      'data-import-queue',
      async (job: Job) => {
        console.log(`Processing job ${job.id} with data ${JSON.stringify(job.data)}`);
        
        // 这里是实际的数据导入逻辑
        await this.performImport(job);
        
        return { success: true };
      },
      { connection: this.queue.opts.connection }, // 使用队列的连接选项
    );

    // 监听事件，如完成、失败等
    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
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
        console.log(d);
        await this.knowledgeService.addEntity(d); // 确保这是个异步操作
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