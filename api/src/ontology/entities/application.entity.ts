import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';

@Entity('ontology_application')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;


  @ManyToMany(() => Schema, (schema) => schema.applications)
  schemas: Schema[];

}
