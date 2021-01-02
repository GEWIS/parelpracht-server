import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { ProductInstance, ProductInstanceStatus } from '../ProductInstance';

@Entity()
export class ProductInstanceActivity extends BaseActivity {
  @Column({ type: 'integer' })
  productInstanceId!: number;

  /** ProductInstance related to this activity */
  @ManyToOne(() => ProductInstance, (productInstance) => productInstance.activities)
  @JoinColumn({ name: 'productInstanceId' })
  productInstance!: ProductInstance;

  /** Subtype of this activity, only used when the type = "STATUS" */
  @Column({
    type: 'enum',
    enum: ProductInstanceStatus,
    nullable: true,
  })
  subType?: ProductInstanceStatus;
}
