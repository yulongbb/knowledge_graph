import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('extraction')
export class Extraction {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column({ length: 500 })
  subject: string;

  @Column({ length: 500 })
  property: string;

  @Column({ length: 500 })
  object: string;
}
