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
import { ThumbnailService } from './thumbnail.service';
import * as path from 'path';

@ApiTags('文件上传') // 分组
@Controller('minio-client')
export class MinioClientController {
  constructor(private readonly minioClientService: MinioClientService,
    private readonly thumbnailService: ThumbnailService
  ) { }

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



  @Post('extract')
  @UseInterceptors(FileInterceptor('video'))
  async extractThumbnail(@UploadedFile() file: Express.Multer.File) {
    const allowedFormats = ['.mp4', '.avi', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedFormats.includes(ext)) {
      throw new HttpException('Unsupported file format', HttpStatus.BAD_REQUEST);
    }

    try {
      const base64Thumbnail = await this.thumbnailService.extractThumbnail(file.buffer);
      return { thumbnail: base64Thumbnail };
    } catch (err) {
      console.error('Error extracting thumbnail:', err); // 记录错误日志
      throw new HttpException('Failed to extract thumbnail', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  
  @Post('cover')
  @UseInterceptors(FileInterceptor('pdf')) // 接收名为 "pdf" 的文件
  async getPdfCover(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No PDF file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const base64Image = await this.thumbnailService.getPdfCover(file.buffer);
      return { cover: base64Image };
    } catch (err) {
      console.error('Error extracting PDF cover:', err);
      throw new HttpException('Failed to extract PDF cover', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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