import {
    Entity,
    Column,
    PrimaryColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { Property } from 'src/ontology/entities/property.entity';

@Entity('ontology_type')
export class Type {
    @PrimaryColumn('uuid', { length: 36 })
    id: string;

    @Column() label: string;

    @Column() description: string;

    @Column({ nullable: true, type: 'text' })
    router?: string;

    @Column({ nullable: true, type: 'text' })
    icon: string;

    @Column({ nullable: true, type: 'text' })
    sort?: number;

    @Column({ nullable: true, length: 36, name: 'parentId' })
    pid?: string;

    @Column({ nullable: true, type: 'text' })
    path?: string;

    @ManyToOne(() => Type, (type) => type.children)
    parent: Type;

    @OneToMany(() => Type, (type) => type.parent)
    children: Type[];

    @ManyToMany(() => Property, (property) => property.types)
    @JoinTable({
        name: 'ontology_type_value',
        joinColumn: { name: 'typeId' },
        inverseJoinColumn: { name: 'propertyId' },
    })
    properties: Property[];
}
