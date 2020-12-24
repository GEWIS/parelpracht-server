import {
  Column, Entity, JoinColumn, OneToOne,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { User } from './User';

@Entity()
export class IdentityLocal extends BaseEnt {
  @Column({ unique: true })
  email!: string;

  @Column()
  verifiedEmail!: boolean;

  @Column()
  salt!: string;

  @Column()
  hash!: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column('integer')
  userId!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
