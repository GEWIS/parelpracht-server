import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../User';
import { BaseEnt } from '../BaseEnt';
import { ActivityType } from '../enums/ActivityType';

export default abstract class BaseActivity extends BaseEnt {
  /** Type of the activity (status or comment) */
  @Column({ type: 'enum', enum: ActivityType, update: false })
  type!: ActivityType;

  /** Description of this activity (English) */
  @Column({ type: 'text' })
  descriptionEnglish!: string;

  /** Description of this activity (Dutch) */
  @Column({ type: 'text' })
  descriptionDutch!: string;

  @Column({ type: 'integer', update: false })
  readonly createdById!: number;

  /** User who created this activity */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  public abstract getRelatedEntity(): BaseEnt;

  public abstract getRelatedEntityId(): number;

  public abstract setRelatedEntityId(id: number): void;

  public abstract setSubType(subType: string): void;
}
