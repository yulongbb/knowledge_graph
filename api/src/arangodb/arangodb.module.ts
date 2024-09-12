import { Module } from '@nestjs/common';
import { Database } from 'arangojs';
import { DatabaseService } from './database.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),

  ],
  providers: [

    DatabaseService,
    {
      provide: 'ARANGODB',
      useFactory: (configService: ConfigService) =>
        new Database({
          url: configService.get('ARANGODB_URL'),
          databaseName: configService.get('ARANGODB_NAME', 'kgms'),
          auth: {
            username: configService.get('ARANGODB_USER'),
            password: configService.get('ARANGODB_PASSWORD'),
          },
        }),
      inject: [ConfigService],

    },
  ],
  exports: ['ARANGODB'],
})
export class ArangoDbModule { }
