import {
  BaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn,
  UpdateDateColumn, VersionColumn,
} from 'typeorm';



/**
 * @tsoaModel
 */
export class BaseEnt extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  // Automatically given by TypeORM
  readonly id?: number;

  @CreateDateColumn({ update: false })
  readonly createdAt!: Date;

  @UpdateDateColumn()
  readonly updatedAt!: Date;

  @DeleteDateColumn()
  readonly deletedAt?: Date;

  @VersionColumn()
  readonly version!: number;
}
