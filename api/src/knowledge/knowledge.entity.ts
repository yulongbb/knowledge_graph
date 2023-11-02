import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('knowledge')
export class Knowledge {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

}
