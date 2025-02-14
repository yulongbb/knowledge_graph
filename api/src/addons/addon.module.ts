import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonService } from './addon.service';
import { AddonController } from './addon.controller';
import { Addon } from './entities/addon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Addon])],
  providers: [AddonService],
  controllers: [AddonController],
})
export class AddonModule {}
