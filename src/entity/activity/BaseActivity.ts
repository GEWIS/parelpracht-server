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

export default abstract class BaseActivity extends BaseEnt {
  /** Type of the activity (status or comment) */
  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType;

  /** Subtype of this activity, only used when the type = "STATUS" */
  @Column({ default: '' })
  subType?: string;

  /** Description of this activity */
  @Column()
  description!: string;

  /** User who created this activity */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  createdBy?: User;
}
