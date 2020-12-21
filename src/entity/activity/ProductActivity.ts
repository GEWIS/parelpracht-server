import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Product } from '../Product';

@Entity()
export class ProductActivity extends BaseActivity {
  /** Product related to this activity */
  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn()
  product!: Product;
}
