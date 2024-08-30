import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';

@Entity('ontology_property')
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  enName: string;

  @Column('text', { nullable: true })
  enDescription: string;

  @ManyToMany(() => Schema, (schema) => schema.properties)
  schemas: Schema[];

  @Column()
  type: string;

  @ManyToMany(() => Schema, (schema) => schema.values)
  types: Schema[];
}
