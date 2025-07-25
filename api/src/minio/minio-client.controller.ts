import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
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
import axios from 'axios';

@ApiTags('文件上传') // 分组
@Controller('minio-client')
export class MinioClientController {
  constructor(
    private readonly minioClientService: MinioClientService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

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
      throw new HttpException(
        'Unsupported file format',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const base64Thumbnail = await this.thumbnailService.extractThumbnail(
        file.buffer,
      );
      return { thumbnail: base64Thumbnail };
    } catch (err) {
      console.error('Error extracting thumbnail:', err); // 记录错误日志
      throw new HttpException(
        'Failed to extract thumbnail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      throw new HttpException(
        'Failed to extract PDF cover',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

  @Get('proxy-image')
  @ApiOperation({ summary: '代理获取远程图片' })
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    try {
      // 设置超时时间
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 5000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      // 设置响应头
      res.set({
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      });

      // 返回图片数据
      return res.send(response.data);
    } catch (error) {
      console.error('Proxy image error:', error);
      throw new HttpException('无法获取远程图片', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('folders')
  async getFolders() {
    // 获取所有对象（递归），只返回文件对象的 name 字段
    const allObjects = await this.minioClientService.listAllObjectsRecursively('');
    const arr = Array.isArray(allObjects) ? allObjects : [];
    console.log('所有对象:', arr);
    // 提取所有文件路径，按 / 分割，生成目录树
    const root: any = {};
    for (const obj of arr) {
      if (typeof obj.name === 'string') {
        const parts = obj.name.split('/');
        // 移除最后一段（文件名），只保留目录部分
        if (parts.length > 1) {
          parts.pop();
          let node = root;
          for (const part of parts) {
            if (!node[part]) node[part] = {};
            node = node[part];
          }
        }
      }
    }
    // 递归转换为树结构
    function toTree(obj: any, parentPath = ''): any[] {
      return Object.keys(obj).map(key => {
        const fullPath = parentPath ? `${parentPath}/${key}` : key;
        return {
          label: key,
          id: fullPath,
          children: toTree(obj[key], fullPath)
        };
      });
    }
    return toTree(root);
  }

  @Get('files')
  async getFiles(@Query('folder') folder: string = '') {
    return await this.minioClientService.listFilesByFolder(folder);
  }

  @Post('moveFile')
  async moveFile(
    @Query('oldName') oldName: string,
    @Query('newFolder') newFolder: string,
  ) {
    return await this.minioClientService.moveFile(oldName, newFolder);
  }

  @Get('all-objects')
  async getAllObjects(@Query('prefix') prefix: string = '') {
    return await this.minioClientService.listAllObjectsRecursively(prefix);
  }
}
