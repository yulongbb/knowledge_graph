import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('api_interface')
export class ApiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  interfaceName: string;

  @Column()
  type: string; // 'REST' | 'SPARQL'

  @Column()
  url: string;

  @Column({ nullable: true, type: 'text' })
  query: string;

  @Column()
  method: string;

  @Column({ type: 'json', nullable: true })
  fieldMapping: any;

  // 新增：存储查询结果
  @Column({ type: 'json', nullable: true })
  resultData: any;
}
