import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MinioService } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
import { getMinioConfig } from './config';

@Injectable()
export class MinioClientService {
  private readonly baseBucket: string;

  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
  ) {
    const minioConfig = getMinioConfig(this.configService);
    this.baseBucket = minioConfig.MINIO_BUCKET;
  }

  get client() {
    return this.minio.client;
  }

  async upload(
    file: Express.Multer.File,
    baseBucket: string = this.baseBucket,
  ) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const temp_fileName = file.originalname;
    const hashedFileName = crypto
      .createHash('md5')
      .update(temp_fileName)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const filename = hashedFileName + ext;

    const fileName = `${filename}`;
    const fileBuffer = file.buffer;

    // 定义一个函数来映射文件扩展名到内容类型
    const getContentType = (extension: string): string => {
      switch (extension.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
          return 'image/jpeg';
        case '.png':
          return 'image/png';
        case '.pdf':
          return 'application/pdf';
        // 根据需要添加更多文件扩展名和对应的内容类型
        default:
          return 'application/octet-stream'; // 默认为二进制数据
      }
    };

    const contentType = getContentType(ext);

    return new Promise<any>((resolve) => {
      this.client.putObject(
        baseBucket,
        fileName,
        fileBuffer,
        null,
        { 'Content-Type': contentType }, // 在这里设置内容类型
        async (err) => {
          if (err) {
            throw new HttpException('上传文件出错', HttpStatus.BAD_REQUEST);
          }
          // 上传成功，返回文件信息
          resolve({ name: fileName });
        },
      );
    });
  }

  async listAllFilesByBucket() {
    const tmpByBucket = await this.client.listObjectsV2(
      this.baseBucket,
      '',
      true,
    );
    return this.readData(tmpByBucket);
  }

  async deleteFile(objetName: string, baseBucket: string = this.baseBucket) {
    const tmp: any = await this.listAllFilesByBucket();
    const names = tmp?.map((i) => i.name);
    if (!names.includes(objetName)) {
      throw new HttpException(
        '删除失败，文件不存在',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return this.client.removeObject(baseBucket, objetName, async (err) => {
      if (err) {
        throw new HttpException('删除失败，请重试', HttpStatus.BAD_REQUEST);
      }
    });
  }

  async download(fileName) {
    return await this.client.getObject(this.baseBucket, fileName);
  }

  // 获取所有文件夹（前缀树）
  async listFolders(prefix: string = '') {
    const stream = this.client.listObjectsV2(this.baseBucket, prefix, false);
    const folders = new Set<string>();
    return new Promise<string[]>((resolve, reject) => {
      stream.on('data', (obj) => {
        // 只根据 obj.prefix 判断文件夹（MinIO SDK返回的文件夹对象有prefix属性）
        if (typeof obj.prefix === 'string' && obj.prefix.length > 1) {
          // 去掉结尾的斜杠
          const folderPath = obj.prefix.replace(/\/$/, '');
          // 多层目录支持：如 demo/a/b 拆分为 demo, demo/a, demo/a/b
          const parts = folderPath.split('/');
          let path = '';
          for (const part of parts) {
            path = path ? `${path}/${part}` : part;
            folders.add(path);
          }
        }
      });
      stream.on('end', () => resolve(Array.from(folders)));
      stream.on('error', (err) => reject(err));
    });
  }

  // 按文件夹列出文件
  async listFilesByFolder(folder: string) {
    const prefix = folder ? `${folder}/` : '';
    const stream = this.client.listObjectsV2(this.baseBucket, prefix, false);
    return this.readData(stream);
  }

  // 移动文件（重命名/移动到新文件夹）
  async moveFile(oldName: string, newFolder: string) {
    const newName = newFolder
      ? `${newFolder}/${oldName.split('/').pop()}`
      : oldName.split('/').pop();
    await this.client.copyObject(
      this.baseBucket,
      newName,
      `/${this.baseBucket}/${oldName}`,
      null, // 补充 conditions 参数
    );
    await this.client.removeObject(this.baseBucket, oldName);
    return { name: newName };
  }

  // 查询所有层级的目录和文件（递归）
  async listAllObjectsRecursively(prefix: string = '') {
    // recursive=true，返回所有层级的对象
    const stream = this.client.listObjectsV2(this.baseBucket, prefix, true);
    return this.readData(stream);
  }

  readData = async (stream) =>
    new Promise((resolve, reject) => {
      const a = [];
      stream
        .on('data', function (row) {
          a.push(row);
        })
        .on('end', function () {
          resolve(a);
        })
        .on('error', function (error) {
          reject(error);
        });
    });
}
