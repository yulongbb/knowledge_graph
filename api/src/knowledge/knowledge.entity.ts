import { Schema } from 'src/ontology/entities/schema.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity('knowledge')
export class Knowledge {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Schema, (schema) => schema.knowledge)
  schemas: Schema[];
}
