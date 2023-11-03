import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MinioClientService } from './minio-client.service';

@ApiTags('文件上传') // 分组
@Controller('minio-client')
export class MinioClientController {
  constructor(private readonly minioClientService: MinioClientService) {}

  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '文件上传,返回 url 地址' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          description: '文件',
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadMinio(@UploadedFile() file: Express.Multer.File) {
    return await this.minioClientService.upload(file);
  }

  @ApiOperation({ summary: '删除文件' })
  @Delete('deleteFile/:fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    return await this.minioClientService.deleteFile(fileName);
  }

  @ApiOperation({ summary: '文件列表' })
  @Get('fileList')
  async fileList() {
    return await this.minioClientService.listAllFilesByBucket();
  }

  @ApiOperation({ summary: '通过文件流下载指定文件' })
  @Get('download/:fileName')
  async download(@Param('fileName') fileName: string, @Res() res: Response) {
    const readerStream = await this.minioClientService.download(fileName);
    readerStream.on('data', (chunk) => {
      res.write(chunk, 'binary');
    });
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=' + fileName,
    });
    readerStream.on('end', () => {
      res.end();
    });
    readerStream.on('error', () => {
      throw new HttpException(
        '下载失败，请重试',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  }
} 