import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plugin } from './plugin.entity';

@Entity()
export class PluginMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  sender: string;

  @Column()
  pluginId: number;

  @ManyToOne(() => Plugin)
  @JoinColumn({ name: 'pluginId' })
  plugin: Plugin;
}
