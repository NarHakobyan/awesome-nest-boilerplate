import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column({ nullable: true })
    thumbnail: string;

    @CreateDateColumn({ type: 'timestamp without time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp without time zone' })
    updatedAt: Date;
}
