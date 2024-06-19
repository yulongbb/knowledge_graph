import { Module } from '@nestjs/common';
import { Database } from 'arangojs';

@Module({
  providers: [
    {
      provide: 'ARANGODB',
      useFactory: async () =>
        await new Database({
          url: 'http://127.0.0.1:8529',
          databaseName: 'kgms',
          auth: { username: 'root', password: 'root' },
        }),
    },
  ],
  exports: ['ARANGODB'],
})
export class ArangoDbModule {}
