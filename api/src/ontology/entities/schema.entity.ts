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

@Entity('ontology_schema')
export class Schema {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column({ name: 'name' }) name: string;

  @Column({ default: 1 }) value: number;
  @Column() label: string;
  @Column() description: string;
  @Column() collection: string;

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


}
