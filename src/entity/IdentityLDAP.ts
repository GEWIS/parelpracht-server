import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class IdentityLDAP {
  /** ID of the associated user */
  @PrimaryColumn('integer')
  readonly id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ default: false })
  overrideEmail!: boolean;

  @Column({ nullable: true })
  lastLogin?: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user!: User;

  /** Date at which this entity has been created */
  @CreateDateColumn({ update: false })
  readonly createdAt!: Date;

  /** Date at which this entity has last been updated */
  @UpdateDateColumn()
  updatedAt!: Date;

  /** If this entity has been soft-deleted, this is the date
   *  at which the entity has been deleted */
  @DeleteDateColumn()
  deletedAt?: Date;

  /** Version number of this entity */
  @VersionColumn()
  version!: number;
}
