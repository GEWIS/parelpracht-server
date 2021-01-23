import {
  Column, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { User } from '../User';
import { BaseEnt } from '../BaseEnt';
import { ActivityType } from '../enums/ActivityType';

export default abstract class BaseActivity extends BaseEnt {
  /** Type of the activity (status or comment) */
  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType;

  /** Description of this activity */
  @Column()
  description!: string;

  @Column({ type: 'integer' })
  createdById!: number;

  /** User who created this activity */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;
}
