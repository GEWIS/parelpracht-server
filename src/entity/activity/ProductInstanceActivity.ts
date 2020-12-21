import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from '../ProductInstance';

@Entity()
export class ProductInstanceActivity extends BaseActivity {
  /** ProductInstance related to this activity */
  @ManyToOne(() => ProductInstance, { nullable: false })
  @JoinColumn()
  productInstance!: ProductInstance;
}
