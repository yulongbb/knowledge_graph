import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioClientModule } from '../minio/minio-client.module';
import { ThreeDModel } from './3d-model.entity';
import { ThreeDModelController } from './3d-model.controller';
import { ThreeDModelService } from './3d-model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThreeDModel]),
    MinioClientModule
  ],
  controllers: [ThreeDModelController],
  providers: [ThreeDModelService],
  exports: [ThreeDModelService]
})
export class ThreeDModelModule {}
