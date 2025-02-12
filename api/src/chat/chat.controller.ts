import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Session } from './entities/session.entity';
import { Message } from './entities/message.entity';

@Controller('sessions')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAllSessions(): Promise<Session[]> {
    return this.chatService.findAllSessions();
  }

  @Get(':id')
  findSessionById(@Param('id') id: number): Promise<Session> {
    return this.chatService.findSessionById(id);
  }

  @Post()
  createSession(@Body('name') name: string): Promise<Session> {
    return this.chatService.createSession(name);
  }

  @Put(':id')
  updateSession(@Param('id') id: number, @Body('name') name: string): Promise<void> {
    return this.chatService.updateSession(id, name);
  }

  @Delete(':id')
  deleteSession(@Param('id') id: number): Promise<void> {
    return this.chatService.deleteSession(id);
  }

  @Get(':id/messages')
  findAllMessages(@Param('id') id: number): Promise<Message[]> {
    return this.chatService.findAllMessages(id);
  }

  @Post(':id/messages')
  createMessage(@Param('id') id: number, @Body('text') text: string, @Body('sender') sender: string): Promise<Message> {
    return this.chatService.createMessage(id, text, sender);
  }

  @Delete(':id/messages')
  deleteMessages(@Param('id') id: number): Promise<void> {
    return this.chatService.deleteMessages(id);
  }

}
