import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('extraction')
export class Extraction {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column()
  subject: string;

  @Column()
  property: string;

  @Column()
  object: string;
}
