import { ApiProperty } from '@nestjs/swagger';

/**
 * 批处理任务状态枚举
 */
export enum BatchTaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 批处理任务类型枚举
 */
export enum BatchTaskType {
  ENTITY_BATCH = 'entity-batch',      // 批量编辑实体
  ENTITY_NEW_BATCH = 'entity-new-batch', // 批量创建实体
  RELATION_BATCH = 'relation-batch',  // 批量关系处理
}

/**
 * 批处理任务模型
 */
export class BatchTask {
  @ApiProperty({ description: '任务ID' })
  id: string;

  @ApiProperty({ description: '任务类型', enum: BatchTaskType, example: 'entity-batch' })
  type: string;

  @ApiProperty({ description: '任务状态', enum: BatchTaskStatus })
  status: BatchTaskStatus;

  @ApiProperty({ description: '创建时间', example: '2023-04-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: '最后更新时间', example: '2023-04-01T12:00:00.000Z' })
  updatedAt?: string;

  @ApiProperty({ description: '创建者ID或用户名', example: 'admin' })
  createdBy: string;

  @ApiProperty({ description: '任务进度，0-100', example: 50 })
  progress?: number;

  @ApiProperty({ description: '任务处理的实体ID数组', type: [String], required: false })
  entities?: string[];

  @ApiProperty({ description: '任务描述', required: false })
  description?: string;

  @ApiProperty({ description: '任务结果', required: false })
  result?: any;

  @ApiProperty({ description: '错误信息', required: false })
  error?: string;
  
  @ApiProperty({ description: '任务数据', required: false })
  data?: any[];
}

/**
 * 批处理任务创建DTO
 */
export class CreateBatchTaskDto {
  @ApiProperty({ description: '任务ID', required: false })
  id?: string;

  @ApiProperty({ description: '任务类型', enum: BatchTaskType, example: 'entity-batch' })
  type: string;

  @ApiProperty({ description: '创建者ID或用户名', example: 'admin' })
  createdBy: string;

  @ApiProperty({ description: '任务处理的实体ID数组', type: [String], required: false })
  entities?: string[];

  @ApiProperty({ description: '任务描述', required: false })
  description?: string;
  
  @ApiProperty({ description: '任务数据', required: false })
  data?: any[];
}

/**
 * 批处理任务更新DTO
 */
export class UpdateBatchTaskDto {
  @ApiProperty({ description: '任务ID' })
  id: string;

  @ApiProperty({ description: '任务状态', enum: BatchTaskStatus, required: false })
  status?: BatchTaskStatus;

  @ApiProperty({ description: '任务进度，0-100', example: 50, required: false })
  progress?: number;

  @ApiProperty({ description: '任务结果', required: false })
  result?: any;

  @ApiProperty({ description: '错误信息', required: false })
  error?: string;
}

/**
 * 批处理任务响应
 */
export class BatchTaskResponse {
  @ApiProperty({ description: '操作是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '响应消息', example: '批处理任务创建成功' })
  message: string;

  @ApiProperty({ description: '任务数据', type: BatchTask })
  data?: BatchTask;
}
