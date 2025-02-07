import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Session } from './session.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  sender: string;

  @Column()
  sessionId: number;

  @ManyToOne(() => Session)
  @JoinColumn({ name: 'sessionId' })
  session: Session;
}
