import {
  Entity,
  Column,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Property } from 'src/ontology/entities/property.entity';
import { Tag } from './tag.entity';
import { Application } from './application.entity';
import { Namespace } from './namespace.entity';

@Entity('ontology_schema')
export class Schema {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column({ name: 'name' }) name: string;
  @Column({ type: 'text' }) label: string;

  @Column({ nullable: true, default: 1 }) value: number;
  @Column({ nullable: true, type: 'text' }) description: string;
  @Column({ nullable: true, type: 'text' }) collection: string;

  @Column({ nullable: true, type: 'text' })
  router?: string;

  @Column({ nullable: true, type: 'text' })
  icon: string;

  @Column({ nullable: true, type: 'text' })
  sort?: number;

  @Column({ nullable: true, length: 36, name: 'parentId' })
  pid?: string;

  @Column({ nullable: true, type: 'text' })
  path?: string;
  @Column({ nullable: true, type: 'text' })
  color?: string;
  @Column({ nullable: true, type: 'text' })

  @ManyToOne(() => Schema, (schema) => schema.children)
  parent: Schema;

  @OneToMany(() => Schema, (schema) => schema.parent)
  children: Schema[];

  @ManyToOne(() => Namespace, (namespace) => namespace.schemas, { nullable: true })
  namespace: Namespace;

  @Column({ nullable: true })
  namespaceId: string;

  @ManyToMany(() => Property, (property) => property.schemas)
  @JoinTable({
    name: 'ontology_schema_property',
    joinColumn: { name: 'schemaId' },
    inverseJoinColumn: { name: 'propertyId' },
  })
  properties: Property[];

  @ManyToMany(() => Property, (property) => property.types)
  @JoinTable({
    name: 'ontology_type_value',
    joinColumn: { name: 'schemaId' },
    inverseJoinColumn: { name: 'propertyId' },
  })
  values: Property[];

  @ManyToMany(() => Tag, (tag) => tag.schemas)
  @JoinTable({
    name: 'ontology_schema_tag',
    joinColumn: { name: 'schemaId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];

  @ManyToMany(() => Application, (application) => application.schemas)
  @JoinTable({
    name: 'ontology_schema_application',
    joinColumn: { name: 'schemaId' },
    inverseJoinColumn: { name: 'applicationId' },
  })
  applications: Application[];
}
