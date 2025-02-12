import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  findAllSessions(): Promise<Session[]> {
    return this.sessionsRepository.find();
  }

  findSessionById(id: number): Promise<Session> {
    return this.sessionsRepository.findOne({ where: { id } });
  }

  createSession(name: string): Promise<Session> {
    const session = this.sessionsRepository.create({ name });
    return this.sessionsRepository.save(session);
  }

  updateSession(id: number, name: string): Promise<void> {
    return this.sessionsRepository.update(id, { name }).then(() => {});
  }

  deleteSession(id: number): Promise<void> {
    return this.sessionsRepository.delete(id).then(() => {});
  }

  findAllMessages(sessionId: number): Promise<Message[]> {
    return this.messagesRepository.find({ where: { sessionId } });
  }

  createMessage(sessionId: number, text: string, sender: string): Promise<Message> {
    const message = this.messagesRepository.create({ sessionId, text, sender });
    return this.messagesRepository.save(message);
  }

  
  deleteMessages(sessionId: number): Promise<void> {
    return this.messagesRepository.find({ where: { sessionId } }).then(messages => { 
      this.messagesRepository.remove(messages).then(() => {});
     });
  }

}
