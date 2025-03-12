import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { Contract } from './Contract';
import { Invoice } from './Invoice';
import { Product } from './Product';
import { ProductInstanceActivity } from './activity/ProductInstanceActivity';

@Entity()
export class ProductInstance extends BaseEnt {
  @Column({ type: 'integer', update: false })
  readonly productId!: number;

  /** The ID of the product, this entity is instanced from */
  @ManyToOne(() => Product, (product) => product.instances)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'integer', update: false })
  readonly contractId!: number;

  /** Contract this product is used in */
  @ManyToOne(() => Contract, (contract) => contract.products)
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  @Column({ nullable: true, type: 'integer' })
  invoiceId!: number | null;

  /** Invoice this product is used in, if it has already been invoiced */
  @ManyToOne(() => Invoice, (invoice) => invoice.products, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice | null;

  /** All activities regarding this product instance */
  @OneToMany(() => ProductInstanceActivity, (productInstanceActivity) => productInstanceActivity.productInstance)
  @JoinColumn()
  activities!: ProductInstanceActivity[];

  /** Actual price of the product, should be a copy from the product price upon creation,
   * or a different price that is not a discount
   * price is excluding VAT */
  @Column({ type: 'integer' })
  basePrice!: number;

  /** Optional discount amount, discount is taken over excl. VAT price */
  @Column({ type: 'integer', default: 0 })
  discount!: number;

  /** Any comments regarding this product instance */
  @Column({ type: 'text', nullable: true, default: '' })
  details!: string | null;

  public price(): number {
    return this.basePrice - this.discount;
  }

  public discountPercentage(): string {
    return `${((this.discount / this.basePrice) * 100).toFixed(2)}`;
  }

  override async setUpdatedAtToNow(): Promise<void> {
    const promises: Promise<void>[] = [];
    if (this.contract !== undefined) {
      promises.push(this.contract.setUpdatedAtToNow());
    }
    promises.push(super.setUpdatedAtToNow());

    await Promise.all(promises);
  }
}
