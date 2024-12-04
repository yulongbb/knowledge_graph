import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('dataset')
export class Dataset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  content: string;

  @Column('text', { nullable: true })
  type: string;
  
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  files: string[];

}
