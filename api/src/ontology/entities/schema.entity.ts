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

@Entity('ontology_schema')
export class Schema {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column() label: string;

  @Column() description: string;

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

  @ManyToOne(() => Schema, (schema) => schema.children)
  parent: Schema;

  @OneToMany(() => Schema, (schema) => schema.parent)
  children: Schema[];

  @ManyToMany(() => Property, (property) => property.schemas)
  @JoinTable({
    name: 'ontology_schema_property',
    joinColumn: { name: 'schemaId' },
    inverseJoinColumn: { name: 'propertyId' },
  })
  properties: Property[];


}
