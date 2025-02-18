import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Addon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rating: number;

  @Column()
  description: string;

  @Column()
  reviews: number;

  @Column()
  category: string;

  @Column()
  image: string;

  @Column()
  url: string;
  
}
