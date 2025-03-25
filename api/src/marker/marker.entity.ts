import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Marker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column('float')
  positionX: number;

  @Column('float')
  positionY: number;

  @Column('float')
  positionZ: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
