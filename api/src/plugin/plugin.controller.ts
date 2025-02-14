import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { Plugin } from './entities/plugin.entity';
import { PluginMessage } from './entities/plugin-message.entity';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get()
  findAllPlugins(): Promise<Plugin[]> {
    return this.pluginService.findAllPlugins();
  }

  @Get(':id')
  findPluginById(@Param('id') id: number): Promise<Plugin> {
    return this.pluginService.findPluginById(id);
  }

  @Post()
  createPlugin(@Body() plugin: Plugin): Promise<Plugin> {
    return this.pluginService.createPlugin(plugin);
  }

  @Put(':id')
  updatePlugin(@Param('id') id: number, @Body() plugin: Plugin): Promise<void> {
    return this.pluginService.updatePlugin(id, plugin);
  }

  @Delete(':id')
  deletePlugin(@Param('id') id: number): Promise<void> {
    return this.pluginService.deletePlugin(id);
  }

  @Post(':id/call-model')
  async callModelApi(@Param('id') id: number, @Body('messages') messages: { text: string, sender: string }[]): Promise<any> {
    return this.pluginService.callModelApi(id, messages);
  }

  @Get(':id/messages')
  findAllMessages(@Param('id') id: number): Promise<PluginMessage[]> {
    return this.pluginService.findAllMessages(id);
  }
}
