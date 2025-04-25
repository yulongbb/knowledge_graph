import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { Namespace } from './namespace.entity';

@Entity('ontology_dictionary')
export class Dictionary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  code: string;

  @Column('text', { nullable: true })
  value: string;

  @ManyToOne(() => Property, (property) => property.dictionaries)
  property: Property;

  @Column('text', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Namespace, (namespace) => namespace.dictionaries, { nullable: true })
  namespace: Namespace;

  @Column({ nullable: true })
  namespaceId: string;
}
