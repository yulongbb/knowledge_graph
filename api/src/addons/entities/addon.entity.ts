import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Addon {
  @ApiProperty({ 
    description: '插件的唯一标识符',
    example: 1
  })
  @PrimaryGeneratedColumn()
  id: number; // 插件的唯一标识符

  @ApiProperty({ 
    description: '插件名称', 
    example: 'Code Spell Checker' 
  })
  @Column()
  name: string; // 插件名称

  @ApiProperty({ 
    description: '插件的平均评分', 
    example: 4.7 
  })
  @Column()
  rating: number; // 插件的平均评分

  @ApiProperty({ 
    description: '插件的详细描述',
    example: '这是一个用于检查代码中拼写错误的插件' 
  })
  @Column({ type: 'text' })
  description: string; // 插件的详细描述

  @ApiProperty({ 
    description: '插件的评论数量',
    example: 250 
  })
  @Column()
  reviews: number; // 插件的评论数量

  @ApiProperty({ 
    description: '插件所属类别',
    example: '编程工具' 
  })
  @Column()
  category: string; // 插件所属类别

  @ApiProperty({ 
    description: '插件图片的URL',
    example: 'https://example.com/plugin-image.png' 
  })
  @Column()
  image: string; // 插件图片的URL

  @ApiProperty({ 
    description: '插件页面的URL',
    example: 'https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker' 
  })
  @Column()
  url: string; // 插件页面的URL

  @ApiProperty({ 
    description: '是否固定该插件',
    example: false,
    default: false
  })
  @Column({ default: false })
  isPinned: boolean; // 是否固定该插件

  @ApiProperty({ 
    description: '插件截图的URL数组',
    example: ['https://example.com/screenshot1.png', 'https://example.com/screenshot2.png'],
    nullable: true,
    type: [String]
  })
  @Column('simple-array', { nullable: true })
  screenshots: string[]; // 插件截图的URL数组

  @ApiProperty({ 
    description: '用户评分的数组',
    example: [4, 5, 4, 5, 3],
    nullable: true,
    type: [Number]
  })
  @Column('simple-array', { nullable: true })
  userRatings: number[]; // 用户评分的数组

  @ApiProperty({ 
    description: '插件收到的总评分数量',
    example: 5,
    default: 0
  })
  @Column({ default: 0 })
  totalRatings: number; // 插件收到的总评分数量
}
