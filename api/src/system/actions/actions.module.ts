import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';

/**
 * 操作权限管理模块
 * 提供操作权限的增删改查功能
 */
@Module({
    imports:[
        TypeOrmModule.forFeature([Action])
    ],
    controllers: [ActionsController],
    providers: [ActionsService]
})
export class ActionsModule { }
