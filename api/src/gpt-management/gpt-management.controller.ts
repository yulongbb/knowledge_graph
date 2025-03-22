import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GptManagementService } from './gpt-management.service';
import { GptModel } from './entities/gpt-model.entity';

@Controller('gpt-management')
export class GptManagementController {
  constructor(private readonly gptManagementService: GptManagementService) {}

  @Get()
  findAll() {
    return this.gptManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.gptManagementService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() gptModel: Partial<GptModel>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      gptModel.logo = file.filename; // 只存储文件名
    }
    return this.gptManagementService.create(gptModel);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @Body() gptModel: Partial<GptModel>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      gptModel.logo = file.filename; // 只存储文件名
    }
    return this.gptManagementService.update(id, gptModel);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.gptManagementService.delete(id);
  }
}
