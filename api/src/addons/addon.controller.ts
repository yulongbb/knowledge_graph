import { Controller, Get, Post, Put, Delete, Param, Body, Query, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { AddonService } from './addon.service';
import { Addon } from './entities/addon.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('addons')
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Get()
  findAll(@Query('category') category?: string): Promise<Addon[]> {
    if (category) {
      return this.addonService.findByCategory(category);
    }
    return this.addonService.findAll();
  }

  @Get('categories')
  findCategories(): Promise<string[]> {
    return this.addonService.findCategories();
  }

  @Get('pinned')
  findPinned(): Promise<Addon[]> {
    return this.addonService.findPinned();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Addon> {
    return this.addonService.findOne(id);
  }

  @Post()
  create(@Body() addon: Addon): Promise<Addon> {
    return this.addonService.create(addon);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() addon: Addon): Promise<Addon> {
    return this.addonService.update(id, addon);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.addonService.remove(id);
  }

  @Post(':id/pin')
  togglePin(@Param('id') id: number): Promise<void> {
    return this.addonService.togglePin(id);
  }

  @Post('upload-screenshot')
  @UseInterceptors(FileInterceptor('file'))
  uploadScreenshot(@UploadedFile() file: Express.Multer.File): { url: string } {
    // Simulate saving the file and returning its URL
    const url = `/uploads/${file.filename}`;
    return { url };
  }

  @Post('upload-screenshots')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  async uploadScreenshots(@UploadedFiles() files: Array<Express.Multer.File>): Promise<{ urls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Save files and generate URLs
    const urls = files.map(file => `/uploads/${file.filename}`);
    return { urls };
  }

  @Post(':id/rate')
  async rateAddon(
    @Param('id') id: number,
    @Body() data: { rating: number }
  ): Promise<Addon> {
    return this.addonService.addRating(id, data.rating);
  }
}
