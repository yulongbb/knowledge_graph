import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Namespace } from './namespace.entity';

@Entity('ontology_application')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('float', { nullable: true, default: 0 })
  rating: number;

  @Column('int', { nullable: true, default: 0 })
  reviews: number;

  @Column('int', { nullable: true, default: 0 })
  totalRatings: number;

  @Column('text', { nullable: true }) // 单值字段：分类
  category: string;

  @Column('simple-array', { nullable: true }) // 多值字段：标签
  tags: string[];

  @Column('text', { nullable: true })
  image: string; // 主图片

  @Column('simple-array', { nullable: true }) // 使用 simple-array 存储截图数组
  screenshots: string[]; // 截图数组

  @Column('text', { nullable: true })
  url: string; // 应用访问链接

  @Column('boolean', { nullable: true, default: false })
  isPinned: boolean; // 是否置顶

  @Column('simple-array', { nullable: true }) // 存储用户评分数组
  userRatings: number[];

  @ManyToMany(() => Namespace, (namespace) => namespace.applications)
  @JoinTable({
    name: 'ontology_application_namespace',
    joinColumn: {
      name: 'application_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'namespace_id',
      referencedColumnName: 'id',
    },
  })
  namespaces: Namespace[];
}