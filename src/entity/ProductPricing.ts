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
import { Product } from './Product';

@Entity()
export class ProductPricing {
  @PrimaryColumn('integer')
  readonly id!: number;

  /** Piece of text to be placed above the table */
  @Column()
  description!: string;

  /** Table parsed as a JSON object */
  @Column({ type: 'simple-json' })
  data!: string[][];

  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  product!: Product;

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
