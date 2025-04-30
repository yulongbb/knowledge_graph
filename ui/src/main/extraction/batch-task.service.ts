import { Injectable } from '@angular/core';
import { EntityService } from '../entity/entity.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { XMessageService } from '@ng-nest/ui/message';
import { v4 as uuidv4 } from 'uuid';

/**
 * 批处理任务状态
 */
export enum BatchTaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 批处理任务模型
 */
export interface BatchTask {
  id: string;
  type: string;
  description: string;
  createdBy: string;
  entities?: string[];
  data?: any[];
  status?: BatchTaskStatus;
  progress?: number;
  createdAt?: string;
  result?: any;
}

/**
 * 批处理任务服务
 * 提供批处理任务相关的功能
 */
@Injectable({
  providedIn: 'root'
})
export class BatchTaskService {
  constructor(
    private entityService: EntityService,
    private message: XMessageService
  ) {}

  /**
   * 创建新的批处理任务
   * @param taskData 任务数据
   */
  createTask(taskData: Partial<BatchTask>): Observable<any> {
    const task: BatchTask = {
      id: taskData.id || uuidv4(),
      type: taskData.type || 'entity-new-batch',
      description: taskData.description || '批量处理任务',
      createdBy: taskData.createdBy || 'current-user',
      entities: taskData.entities || [],
      data: taskData.data || [],
      createdAt: new Date().toISOString(),
      status: BatchTaskStatus.PENDING,
      progress: 0
    };

    return this.entityService.createBatchTask(task).pipe(
      catchError(error => {
        this.message.error(`创建批处理任务失败: ${error.message || error}`);
        return of({ success: false, error });
      })
    );
  }

  /**
   * 获取批处理任务
   * @param id 任务ID
   */
  getTask(id: string): Observable<BatchTask> {
    return this.entityService.getBatchTask(id).pipe(
      catchError(error => {
        this.message.error(`获取批处理任务失败: ${error.message || error}`);
        return of({
          id: '',
          type: '',
          description: '',
          createdBy: '',
          entities: [],
          data: [],
          status: BatchTaskStatus.FAILED,
          progress: 0,
          createdAt: '',
          result: null
        });
      })
    );
  }

  /**
   * 更新批处理任务状态
   * @param task 任务数据
   */
  updateTask(task: Partial<BatchTask>): Observable<any> {
    return this.entityService.updateBatchTask(task).pipe(
      catchError(error => {
        this.message.error(`更新批处理任务失败: ${error.message || error}`);
        return of({ success: false, error });
      })
    );
  }

  /**
   * 获取所有批处理任务
   */
  getAllTasks(): Observable<any> {
    return this.entityService.getBatchTasks().pipe(
      catchError(error => {
        this.message.error(`获取批处理任务列表失败: ${error.message || error}`);
        return of({ total: 0, items: [] });
      })
    );
  }

  /**
   * 批量处理数据提交
   * @param task 批处理任务
   * @param entities 实体数据
   */
  processBatchData(entities: any[]): Observable<any> {
    return this.entityService.import(entities).pipe(
      catchError(error => {
        this.message.error(`批量处理提交失败: ${error.message || error}`);
        return of({ success: false, error });
      })
    );
  }
}
