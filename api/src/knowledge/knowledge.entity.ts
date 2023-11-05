import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('knowledge')
export class Knowledge {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;
}
