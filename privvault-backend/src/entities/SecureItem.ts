import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity('secure_items')
export class SecureItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column('text')
  encryptedContent!: string

  @Column()
  category!: string

  @Column({ nullable: true })
  fileName?: string

  @ManyToOne(() => User, user => user.items, { onDelete: 'CASCADE' })
  user!: User

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date
} 