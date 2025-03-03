import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
// import { exec } from 'child_process';
// // 使用 require 导入 pdf-image
// import { getDocument } from 'pdfjs-dist';
// import { createCanvas } from 'canvas';

@Injectable()
export class ThumbnailService {
  // async extractThumbnail(videoBuffer: Buffer): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const tempFilePath = path.join(__dirname, 'temp_video.mp4');
  //     const outputFilePath = path.join(__dirname, 'thumbnail.jpg');

  //     // 将 Buffer 写入临时文件
  //     fs.writeFileSync(tempFilePath, videoBuffer);

  //     // 调用命令行工具
  //     const command = `ffmpeg -i ${tempFilePath} -ss 00:00:01 -vframes 1 -s 320x240 ${outputFilePath}`;
  //     exec(command, (err) => {
  //       if (err) {
  //         console.error('FFmpeg command error:', err); // 记录错误日志
  //         reject(err);
  //       } else {
  //         const base64Thumbnail = fs.readFileSync(outputFilePath, 'base64');
  //         // 删除临时文件
  //         fs.unlinkSync(tempFilePath);
  //         fs.unlinkSync(outputFilePath);
  //         resolve(base64Thumbnail);
  //       }
  //     });
  //   });
  // }

  // async getPdfCover(pdfBuffer: Buffer): Promise<string> {
  //   try {
  //     // 1. 加载 PDF 文件
  //     const loadingTask = getDocument({ data: pdfBuffer });
  //     const pdf = await loadingTask.promise;
  
  //     // 2. 检查 PDF 文件是否有页面
  //     const pageCount = pdf.numPages;
  //     if (pageCount === 0) {
  //       throw new Error('PDF 文件没有页面');
  //     }
  
  //     // 3. 获取第一页
  //     const page = await pdf.getPage(1); // 页码从 1 开始
  
  //     // 4. 设置渲染选项
  //     const viewport = page.getViewport({ scale: 1.0 });
  //     const canvas = createCanvas(600, 800);
  //     const context = canvas.getContext('2d');
  
  //     // 5. 调整页面大小以适应 canvas
  //     const scale = Math.min(600 / viewport.width, 800 / viewport.height);
  //     const scaledViewport = page.getViewport({ scale });
  
  //     // 6. 渲染页面到 canvas
  //     await page.render({
  //       canvasContext: context,
  //       viewport: scaledViewport,
  //     }).promise;
  
  //     // 7. 将 canvas 转换为 Base64 图像
  //     const base64Image = canvas.toDataURL('image/png');
  
  //     // 8. 返回 Base64 图片数据
  //     return base64Image;
  //   } catch (error) {
  //     console.error('Error in getPdfCover:', error);
  //     throw new Error('Failed to generate PDF cover');
  //   }
  // }
}