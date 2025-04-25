import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Namespace } from './namespace.entity';

@Entity('ontology_tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  type: string;

  @ManyToMany(() => Schema, (schema) => schema.tags)
  schemas: Schema[];

  @ManyToOne(() => Namespace, (namespace) => namespace.tags, { nullable: true })
  namespace: Namespace;

  @Column({ nullable: true })
  namespaceId: string;
}
