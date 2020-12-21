import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from '../ProductInstance';

@Entity()
export class ProductInstanceActivity extends BaseActivity {
  @Column({ type: 'integer' })
  productInstanceId!: number;

  /** ProductInstance related to this activity */
  @ManyToOne(() => ProductInstance, (productInstance) => productInstance.productInstanceActivities)
  @JoinColumn({ name: 'productInstanceId' })
  productInstance!: ProductInstance;
}
