import { Module } from '@nestjs/common';
import { NodeService } from './node.service';

import { NodeController } from './node.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';

@Module({
  imports: [ArangoDbModule],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
