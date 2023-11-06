import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('knowledge')
export class Knowledge {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;


  @Column()
  name: string;

  @Column()
  description: string;
}
