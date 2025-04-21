import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = process.env.NODE_ENV || 'development';

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const apiPrefix = configService.get('API_PREFIX');
  app.setGlobalPrefix(apiPrefix);

  // 使用NestJS的use方法添加中间件
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const options = new DocumentBuilder()
    .setTitle('知识图谱')
    .setDescription(`接口文档 - ${nodeEnv.toUpperCase()} 环境`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(apiPrefix, app, document);

  const port = configService.get('APP_PORT');
  await app.listen(port);
  console.log(`Application is running in ${nodeEnv.toUpperCase()} mode`);
  console.log(`Server running on: http://localhost:${port}/${apiPrefix}`);
}
bootstrap();
