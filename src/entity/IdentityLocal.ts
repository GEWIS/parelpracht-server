import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { User } from './User';

@Entity()
export class IdentityLocal extends BaseEnt {
  @Column({ unique: true })
  email!: string;

  @Column()
  verifiedEmail!: boolean;

  @Column({ nullable: true })
  salt?: string;

  @Column({ nullable: true })
  hash?: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user!: User;
}
