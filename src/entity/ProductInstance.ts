import {
  Column, Entity, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Invoice } from './Invoice';
// eslint-disable-next-line import/no-cycle
import { Product } from './Product';
// eslint-disable-next-line import/no-cycle
import { ProductInstanceActivity } from './activity/ProductInstanceActivity';
// eslint-disable-next-line import/no-cycle
import { ProductActivity } from './activity/ProductActivity';

@Entity()
export class ProductInstance extends BaseEnt {
  /** The ID of the product, this entity is instanced from */
  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn()
  product!: Product;

  /** Contract this product is used in */
  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn()
  contract!: Contract;

  /** Invoice this product is used in, if it has already been invoiced */
  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn()
  invoice?: Invoice;

  /** All activities regarding this product instance */
  @OneToMany(() => ProductInstanceActivity,
    (productInstanceActivity) => productInstanceActivity.productInstance)
  @JoinColumn()
  productInstanceActivities!: ProductActivity[];

  /** Actual price of the product. Can be different from the default product price,
   * e.g. for discounts */
  @Column()
  price!: number;

  /** Any comments regarding this product instance */
  @Column({ nullable: true })
  comment?: string;
}
