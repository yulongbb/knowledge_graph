import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Schema } from './schema.entity';
import { Property } from './property.entity';
import { Qualify } from './qualify.entity';
import { Tag } from './tag.entity';
import { Application } from './application.entity';

@Entity('ontology_namespace')
export class Namespace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Fix: Specify length for text column used in unique constraint
  @Column('varchar', { length: 255, nullable: false, unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 50, nullable: true })
  prefix: string;

  @Column('text', { nullable: true })
  uri: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Schema, (schema) => schema.namespace)
  schemas: Schema[];

  @OneToMany(() => Property, (property) => property.namespace)
  properties: Property[];

  @OneToMany(() => Qualify, (qualify) => qualify.namespace)
  qualifiers: Qualify[];

  @OneToMany(() => Tag, (tag) => tag.namespace)
  tags: Tag[];

  @ManyToMany(() => Application, (application) => application.namespaces)
  @JoinTable({
    name: 'ontology_namescape_application',
    joinColumn: { name: 'namescapeId' },
    inverseJoinColumn: { name: 'applicationId' },
  })
  applications: Application[];
}
