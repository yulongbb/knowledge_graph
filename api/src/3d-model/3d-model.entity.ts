import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('three_d_models')
export class ThreeDModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  filePath: string;

  @Column('simple-array')
  tags: string[];

  @Column()
  category: string;

  @Column()
  format: string;

  @Column()
  fileSize: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  previewUrl: string;

  @Column({ type: 'text', nullable: true })
  searchableText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
