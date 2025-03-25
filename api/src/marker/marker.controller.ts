import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MarkerService } from './marker.service';
import { Marker } from './marker.entity';

@Controller('markers')
export class MarkerController {
  constructor(private readonly markerService: MarkerService) {}

  @Post()
  create(@Body() markerData: Partial<Marker>) {
    return this.markerService.create(markerData);
  }

  @Get()
  findAll() {
    return this.markerService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markerService.remove(+id);
  }
}
