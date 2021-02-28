import {
  BaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';

/**
 * @tsoaModel
 */
export class BaseEnt extends BaseEntity {
  /** Incremental ID of the entity */
  @PrimaryGeneratedColumn('increment')
  readonly id!: number;

  /** Date at which this entity has been created */
  @CreateDateColumn({ update: false })
  readonly createdAt!: Date;

  /** Date at which this entity has last been updated */
  @UpdateDateColumn()
  updatedAt!: Date;

  /** If this entity has been soft-deleted, this is the date at which the entity has been deleted */
  @DeleteDateColumn()
  deletedAt?: Date;

  /** Version number of this entity */
  @VersionColumn()
  version!: number;

  async setUpdatedAtToNow(): Promise<void> {
    this.updatedAt = new Date();
    await this.save();
  }
}
