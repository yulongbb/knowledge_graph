import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Plugin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ type: 'text', nullable: true })
  prompt: string;

  @Column({ type: 'json', nullable: true })
  inputParams: { name: string, type: string }[];

  @Column({ type: 'text', nullable: true })
  outputFormat: string;

  @CreateDateColumn()
  createdAt: Date;
}
