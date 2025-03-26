import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Addon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rating: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  reviews: number;

  @Column()
  category: string;

  @Column()
  image: string;

  @Column()
  url: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column('simple-array', { nullable: true })
  screenshots: string[]; // Add this property to store multiple screenshot URLs

  @Column('simple-array', { nullable: true })
  userRatings: number[]; // 存储所有用户评分

  @Column({ default: 0 })
  totalRatings: number; // 总评分人数
}
