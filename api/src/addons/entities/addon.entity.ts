import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Addon {
  @PrimaryGeneratedColumn()
  id: number; // 插件的唯一标识符

  @Column()
  name: string; // 插件名称

  @Column()
  rating: number; // 插件的平均评分

  @Column({ type: 'text' })
  description: string; // 插件的详细描述

  @Column()
  reviews: number; // 插件的评论数量

  @Column()
  category: string; // 插件所属类别

  @Column()
  image: string; // 插件图片的URL

  @Column()
  url: string; // 插件页面的URL

  @Column({ default: false })
  isPinned: boolean; // 是否固定该插件

  @Column('simple-array', { nullable: true })
  screenshots: string[]; // 插件截图的URL数组

  @Column('simple-array', { nullable: true })
  userRatings: number[]; // 用户评分的数组

  @Column({ default: 0 })
  totalRatings: number; // 插件收到的总评分数量
}
