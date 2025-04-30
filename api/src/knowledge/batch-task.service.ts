import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import {
    BatchTask,
    BatchTaskStatus,
    CreateBatchTaskDto,
    UpdateBatchTaskDto
} from './models/batch-task.model';

/**
 * 批处理任务服务
 * 管理批处理任务的创建、查询、更新和删除等操作
 */
@Injectable()
export class BatchTaskService {
    private readonly BATCH_TASK_PREFIX = 'batch:task:';
    private readonly BATCH_TASKS_LIST = 'batch:tasks:list';
    private readonly redis: Redis;

    constructor(
        @Inject('REDIS') private readonly redisClient: Redis,
        private configService: ConfigService
    ) {
        this.redis = redisClient;
    }

    /**
     * 创建新的批处理任务
     * @param createTaskDto 批处理任务创建数据
     * @returns 创建的批处理任务
     */
    async createTask(createTaskDto: CreateBatchTaskDto): Promise<BatchTask> {
        // 生成任务ID（如果未提供）
        const taskId = createTaskDto.id || uuidv4();

        // 创建新任务
        const task: BatchTask = {
            id: taskId,
            type: createTaskDto.type,
            status: BatchTaskStatus.PENDING,
            createdAt: new Date().toISOString(),
            createdBy: createTaskDto.createdBy,
            entities: createTaskDto.entities || [],
            description: createTaskDto.description,
            progress: 0,
            data: createTaskDto.data || [],
        };

        // 将任务保存到Redis
        await this.redis.set(
            `${this.BATCH_TASK_PREFIX}${taskId}`,
            JSON.stringify(task),
            'EX',
            60 * 60 * 24 * 7 // 7天过期
        );

        // 将任务ID添加到任务列表
        await this.redis.zadd(this.BATCH_TASKS_LIST, Date.now(), taskId);

        return task;
    }

    /**
     * 通过ID获取批处理任务
     * @param id 任务ID
     * @returns 批处理任务
     */
    async getTaskById(id: string): Promise<BatchTask> {
        const taskData = await this.redis.get(`${this.BATCH_TASK_PREFIX}${id}`);
        if (!taskData) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return JSON.parse(taskData) as BatchTask;
    }

    /**
     * 获取所有批处理任务
     * @param page 页码
     * @param pageSize 每页大小
     * @param types 任务类型过滤数组
     * @returns 批处理任务分页列表
     */
    async getAllTasks(
        page: number = 1,
        pageSize: number = 20,
        types?: string[]
    ): Promise<{ total: number, items: BatchTask[] }> {
        // 获取所有任务ID
        const allTaskIds = await this.redis.zrevrange(this.BATCH_TASKS_LIST, 0, -1);

        // 批量获取任务详情
        const allTasks: BatchTask[] = [];
        for (const taskId of allTaskIds) {
            try {
                const taskData = await this.redis.get(`${this.BATCH_TASK_PREFIX}${taskId}`);
                if (taskData) {
                    allTasks.push(JSON.parse(taskData) as BatchTask);
                }
            } catch (error) {
                console.error(`Error fetching task ${taskId}:`, error);
            }
        }

        // 应用类型过滤（如果指定）
        const filteredTasks = types ? allTasks.filter(task => types.includes(task.type)) : allTasks;

        // 计算总数
        const total = filteredTasks.length;

        // 应用分页
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const pagedTasks = filteredTasks.slice(startIndex, endIndex);

        return { total, items: pagedTasks };
    }

    /**
     * 更新批处理任务
     * @param updateTaskDto 任务更新数据
     * @returns 更新后的批处理任务
     */
    async updateTask(updateTaskDto: UpdateBatchTaskDto): Promise<BatchTask> {
        const taskId = updateTaskDto.id;

        // 获取现有任务
        const existingTask = await this.getTaskById(taskId);

        // 更新任务属性
        const updatedTask: BatchTask = {
            ...existingTask,
            status: updateTaskDto.status || existingTask.status,
            progress: updateTaskDto.progress !== undefined ? updateTaskDto.progress : existingTask.progress,
            result: updateTaskDto.result || existingTask.result,
            error: updateTaskDto.error || existingTask.error,
            updatedAt: new Date().toISOString(),
        };

        // 保存更新后的任务
        await this.redis.set(
            `${this.BATCH_TASK_PREFIX}${taskId}`,
            JSON.stringify(updatedTask),
            'EX',
            60 * 60 * 24 * 7 // 7天过期
        );

        return updatedTask;
    }

    /**
     * 删除批处理任务
     * @param id 任务ID
     * @returns 操作结果
     */
    async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
        // 检查任务是否存在
        await this.getTaskById(id);

        // 从Redis删除任务
        await this.redis.del(`${this.BATCH_TASK_PREFIX}${id}`);

        // 从任务列表中移除
        await this.redis.zrem(this.BATCH_TASKS_LIST, id);

        return {
            success: true,
            message: `Task ${id} successfully deleted`,
        };
    }
}
