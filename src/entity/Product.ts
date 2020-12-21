import {
  Column, Entity, OneToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from './ProductInstance';
// eslint-disable-next-line import/no-cycle
import { ProductActivity } from './activity/ProductActivity';

@Entity()
export class Product extends BaseEnt {
  @Column()
  nameDutch!: string;

  @Column()
  nameEnglish!: string;

  /** Price is stored * 100 and as integer */
  @Column()
  targetPrice!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  contractTextDutch!: string;

  @Column({ type: 'text' })
  contractTextEnglish!: string;

  @Column({ type: 'text', default: '' })
  deliverySpecificationDutch?: string;

  @Column({ type: 'text', default: '' })
  deliverySpecificationEnglish?: string;

  @OneToMany(() => ProductInstance, (productInstance) => productInstance.product)
  instances!: ProductInstance[];

  @OneToMany(() => ProductActivity, (productActivity) => productActivity.product)
  productActivities!: ProductActivity[];
}
