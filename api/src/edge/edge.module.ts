import { Module } from '@nestjs/common';
import { EdgeService } from './edge.service';

import { EdgeController } from './edge.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';

@Module({
  imports: [ArangoDbModule],
  controllers: [EdgeController],
  providers: [EdgeService],
})
export class EdgeModule {}
