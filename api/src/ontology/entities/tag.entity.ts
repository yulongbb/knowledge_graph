import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';

@Entity('ontology_tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  type: string;

  @ManyToMany(() => Schema, (schema) => schema.tags)
  schemas: Schema[];

}
