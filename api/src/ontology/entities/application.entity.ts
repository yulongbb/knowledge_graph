import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';

@Entity('ontology_application')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('int', { nullable: true })
  rating: number;

  @Column('text', { nullable: true }) // 单值字段：分类
  category: string;

  @Column('simple-array', { nullable: true }) // 多值字段：标签
  tags: string[];

  @Column('simple-array', { nullable: true }) // 使用 simple-array 存储图片数组
  images: string[]; // 图片字段改为数组

  @ManyToMany(() => Schema, (schema) => schema.applications)
  @JoinTable({
    name: 'application_schema',
    joinColumn: {
      name: 'application_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'schema_id',
      referencedColumnName: 'id',
    },
  })
  schemas: Schema[];
}