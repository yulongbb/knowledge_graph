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
 * 批处理任务类型
 */
export enum BatchTaskType {
  ENTITY_BATCH = 'entity-batch',       // 批量编辑现有实体
  ENTITY_NEW_BATCH = 'entity-new-batch', // 批量创建新实体
}

/**
 * 批处理任务模型
 */
export interface BatchTask {
  id: string;
  type: string;
  status?: BatchTaskStatus;
  description: string;
  createdBy: string;
  entities?: string[];
  data?: any[];
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  result?: any;
}

/**
 * 实体基础数据结构
 */
export interface EntityBase {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  type?: string;
  aliases?: string[];
  tags?: string[];
  images?: string[];
}

/**
 * 批处理表格数据行
 */
export interface BatchDataRow {
  名称: string;
  描述: string;
  别名: string;
  类型: string;
  标签: string;
  图片: string;
  [key: string]: any;
}
