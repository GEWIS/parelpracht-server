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
  @Column({ type: 'integer' })
  readonly productId!: number;

  /** The ID of the product, this entity is instanced from */
  @ManyToOne(() => Product, (product) => product.instances)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'integer' })
  readonly contractId!: number;

  /** Contract this product is used in */
  @ManyToOne(() => Contract, (contract) => contract.products)
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  @Column({ nullable: true, type: 'integer' })
  invoiceId?: number;

  /** Invoice this product is used in, if it has already been invoiced */
  @ManyToOne(() => Invoice, (invoice) => invoice.products, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;

  /** All activities regarding this product instance */
  @OneToMany(() => ProductInstanceActivity,
    (productInstanceActivity) => productInstanceActivity.productInstance)
  @JoinColumn()
  productInstanceActivities!: ProductActivity[];

  /** Actual price of the product. Can be different from the default product price,
   * e.g. for discounts */
  @Column({ type: 'integer' })
  price!: number;

  /** Any comments regarding this product instance */
  @Column({ type: 'text', nullable: true, default: '' })
  comments?: string;
}
