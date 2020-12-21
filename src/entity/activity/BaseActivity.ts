import {
  Column, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { User } from '../User';
import { BaseEnt } from '../BaseEnt';

export enum ActivityType {
  STATUS = 'STATUS',
  COMMENT = 'COMMENT',
}

export default class BaseActivity extends BaseEnt {
  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType;

  @Column()
  subType!: string;

  @Column()
  description!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  createdBy!: User;
}
