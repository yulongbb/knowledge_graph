import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  title: string;

  @Column('longtext', { nullable: true })
  content: string;

  @Column('text', { nullable: true })
  author: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateTime: Date;
}
