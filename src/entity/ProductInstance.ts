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
  activities!: ProductInstanceActivity[];

  /** Actual price of the product, should be a copy from the product price upon creation,
   * or a different price that is not a discount */
  @Column({ type: 'integer' })
  basePrice!: number;

  /** Optional discount amount */
  @Column({ type: 'integer', default: 0 })
  discount!: number;

  /** Any comments regarding this product instance */
  @Column({ type: 'text', nullable: true, default: '' })
  comments?: string;

  public price(): number {
    return this.basePrice - this.discount;
  }

  public discountPercentage(): string {
    return `${((this.discount / this.basePrice) * 100).toFixed(2)}`;
  }
}
