import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('extraction_script')
export class Script {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['extraction', 'transformation', 'cleaning'],
    default: 'extraction'
  })
  type: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['javascript', 'python', 'sql'],
    default: 'javascript'
  })
  language: string;

  @Column('varchar', { length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('simple-json', { nullable: true })
  tags: string[];
}
