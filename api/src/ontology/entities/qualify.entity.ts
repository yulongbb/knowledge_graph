import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Property } from 'src/ontology/entities/property.entity';
import { Namespace } from './namespace.entity';

@Entity('ontology_qualify')
export class Qualify {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  label: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  enName: string;

  @Column('text', { nullable: true })
  enDescription: string;

  @ManyToMany(() => Property, (property) => property.qualifiers)
  properties: Property[];

  @Column('text', { nullable: true })
  type: string;

  @ManyToOne(() => Namespace, (namespace) => namespace.qualifiers, {
    nullable: true,
  })
  namespace: Namespace;

  @Column({ nullable: true })
  namespaceId: string;
}
