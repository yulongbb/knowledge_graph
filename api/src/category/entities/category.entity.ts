import { Entity, Column, OneToMany, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @Column({ name: 'name' }) 
  name: string;
  
  @Column({ type: 'text' }) 
  label: string;

  @Column({ nullable: true, type: 'text' }) 
  description: string;

  @Column({ nullable: true, length: 36, name: 'parentId' })
  pid?: string;

  @Column({ nullable: true, type: 'text' })
  path?: string;
  
  @Column({ nullable: true, type: 'text' })
  icon?: string;
  
  @Column({ nullable: true, type: 'text' })
  color?: string;

  @Column({ nullable: true, default: 0 }) 
  sort?: number;

  @ManyToOne(() => Category, (category) => category.children)
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
