import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { SecureItem } from './SecureItem'
import { hashPassword, comparePasswords } from '../utils/crypto'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column()
  passwordHash!: string

  @Column({ nullable: true })
  masterKeyHash?: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => SecureItem, item => item.user)
  items?: SecureItem[]

  async setPassword(password: string) {
    this.passwordHash = await hashPassword(password)
  }

  async comparePassword(password: string): Promise<boolean> {
    return comparePasswords(password, this.passwordHash)
  }
} 