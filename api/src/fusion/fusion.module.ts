import { Module } from '@nestjs/common';
import { FusionService } from './fusion.service';

import { FusionController } from './fusion.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';

@Module({
  imports: [ArangoDbModule],
  controllers: [FusionController],
  providers: [FusionService],
})
export class FusionModule {}
