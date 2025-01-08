import { Entity,JoinTable, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Qualify } from 'src/ontology/entities/qualify.entity';

@Entity('ontology_property')
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  enName: string;

  @Column('text', { nullable: true })
  enDescription: string;

  @ManyToMany(() => Schema, (schema) => schema.properties)
  schemas: Schema[];

  @Column('text', { nullable: true })
  type: string;
  
  @Column('text', { nullable: true })
  group: string;
  
  @ManyToMany(() => Schema, (schema) => schema.values)
  types: Schema[];


  
  @ManyToMany(() => Qualify, (qualify) => qualify.properties)
  @JoinTable({
    name: 'ontology_qualify_property',
    joinColumn: { name: 'propertyId' },
    inverseJoinColumn: { name: 'qualifyId' },
  })
  qualifiers: Qualify[];


  @Column('boolean', { nullable: true })
  isPrimary: string;
}
