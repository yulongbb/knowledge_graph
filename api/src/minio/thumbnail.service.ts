import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class ThumbnailService {
  async extractThumbnail(videoBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempFilePath = path.join(__dirname, 'temp_video.mp4');
      const outputFilePath = path.join(__dirname, 'thumbnail.jpg');

      // 将 Buffer 写入临时文件
      fs.writeFileSync(tempFilePath, videoBuffer);

      // 调用命令行工具
      const command = `ffmpeg -i ${tempFilePath} -ss 00:00:01 -vframes 1 -s 320x240 ${outputFilePath}`;
      exec(command, (err) => {
        if (err) {
          console.error('FFmpeg command error:', err); // 记录错误日志
          reject(err);
        } else {
          const base64Thumbnail = fs.readFileSync(outputFilePath, 'base64');
          // 删除临时文件
          fs.unlinkSync(tempFilePath);
          fs.unlinkSync(outputFilePath);
          resolve(base64Thumbnail);
        }
      });
    });
  }
}