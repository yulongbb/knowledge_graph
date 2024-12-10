import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('dataset')
export class Dataset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  label: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  type: string;
  
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  files: string[];

}
