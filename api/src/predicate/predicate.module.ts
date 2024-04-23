import { Module } from '@nestjs/common';
import { PredicateService } from './predicate.service';

import { PredicateController } from './predicate.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';

@Module({
  imports: [ArangoDbModule],
  controllers: [PredicateController],
  providers: [PredicateService],
})
export class PredicateModule {}
