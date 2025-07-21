import {
  Entity,
  JoinTable,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Qualify } from 'src/ontology/entities/qualify.entity';
import { Namespace } from './namespace.entity';
import { Tag } from './tag.entity';

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
    name: 'ontology_property_qualify',
    joinColumn: { name: 'propertyId' },
    inverseJoinColumn: { name: 'qualifyId' },
  })
  qualifiers: Qualify[];

  @ManyToMany(() => Tag, (tag) => tag.properties)
  @JoinTable({
    name: 'ontology_property_tag',
    joinColumn: { name: 'propertyId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];

  @Column('boolean', { nullable: true })
  isPrimary: string;

  @ManyToOne(() => Namespace, (namespace) => namespace.properties, {
    nullable: true,
  })
  namespace: Namespace;

  @Column({ nullable: true })
  namespaceId: string;
}
