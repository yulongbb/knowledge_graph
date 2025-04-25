import { ApiProperty } from '@nestjs/swagger';

/**
 * 队列任务状态类型
 */
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed';

/**
 * 队列任务状态模型
 */
export class JobStatusInfo {
  @ApiProperty({ description: '任务ID', example: '01GXYZ123ABC' })
  id: string;

  @ApiProperty({ description: '任务名称', example: 'data-import-job' })
  name: string;

  @ApiProperty({ description: '任务状态', enum: ['waiting', 'active', 'completed', 'failed'] })
  status: JobStatus;

  @ApiProperty({ description: '进度百分比', example: 45 })
  progress: number;
}
