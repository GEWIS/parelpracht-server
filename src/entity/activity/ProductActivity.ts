import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Product } from '../Product';

@Entity()
export class ProductActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  readonly productId!: number;

  /** Product related to this activity */
  @ManyToOne(() => Product, (product) => product.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
