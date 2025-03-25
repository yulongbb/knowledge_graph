import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarkerController } from './marker.controller';
import { MarkerService } from './marker.service';
import { Marker } from './marker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Marker])],
  controllers: [MarkerController],
  providers: [MarkerService],
})
export class MarkerModule {}
