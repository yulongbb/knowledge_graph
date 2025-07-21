import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Namespace } from './namespace.entity';
import { Property } from './property.entity';

@Entity('ontology_tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  type: string;

  @ManyToMany(() => Property, (property) => property.tags)
  properties: Property[];

  @ManyToOne(() => Namespace, (namespace) => namespace.tags, { nullable: true })
  namespace: Namespace;

  @Column({ nullable: true })
  namespaceId: string;
}
