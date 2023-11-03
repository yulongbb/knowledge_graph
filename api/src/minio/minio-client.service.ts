import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MinioService } from 'nestjs-minio-client';
import { MINIO_CONFIG } from './config';

@Injectable()
export class MinioClientService {
  private readonly baseBucket = MINIO_CONFIG.MINIO_BUCKET;

  constructor(private readonly minio: MinioService) {}

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

    return new Promise<any>((resolve) => {
      this.client.putObject(baseBucket, fileName, fileBuffer, async (err) => {
        if (err) {
          throw new HttpException('Error upload file', HttpStatus.BAD_REQUEST);
        }
        // 上传成功回传文件信息
        resolve('上传成功');
      });
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