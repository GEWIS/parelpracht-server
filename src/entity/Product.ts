import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { ProductInstance } from './ProductInstance';
import { ProductActivity } from './activity/ProductActivity';
import { ProductFile } from './file/ProductFile';
import { ProductCategory } from './ProductCategory';
import { ProductStatus } from './enums/ProductStatus';
import { ProductPricing } from './ProductPricing';
import { ValueAddedTax } from './ValueAddedTax';

@Entity()
export class Product extends BaseEnt {
  /** Dutch name of the product */
  @Column()
  nameDutch!: string;

  /** English name of the product */
  @Column()
  nameEnglish!: string;

  /** Price is stored * 100 and as integer */
  @Column({ type: 'integer' })
  targetPrice!: number;

  /** Status of the collaboration with this company */
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  /** Description of the product, only used within the application */
  @Column({ type: 'text' })
  description!: string;

  /** Text that should be used on generated PDF files, in Dutch */
  @Column({ type: 'text' })
  contractTextDutch!: string;

  /** Text that should be used on generated PDF files, in English */
  @Column({ type: 'text' })
  contractTextEnglish!: string;

  /** Delivery attachment text used on the PDF file, in Dutch */
  @Column({ type: 'text', default: '' })
  deliverySpecificationDutch?: string;

  /** Delivery attachment text used on the PDF file, in English */
  @Column({ type: 'text', default: '' })
  deliverySpecificationEnglish?: string;

  @Column({ type: 'integer' })
  vatId!: number;

  @Column({ type: 'integer' })
  categoryId!: number;

  /** Target minimum amount contracted for this product */
  @Column({ default: 0 })
  minTarget!: number;

  /** Target maximum amount contracted for this product */
  @Column({ default: 0 })
  maxTarget!: number;

  /** VAT category this product is in */
  @ManyToOne(() => ValueAddedTax, (vat) => vat.products)
  @JoinColumn({ name: 'vatId' })
  valueAddedTax!: ValueAddedTax;

  /** Category this product is in */
  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category!: ProductCategory;

  /** All the product instances of this product, used in contracts and invoiced */
  @OneToMany(() => ProductInstance, (productInstance) => productInstance.product)
  instances!: ProductInstance[];

  /** All activities regarding this product */
  @OneToMany(() => ProductActivity, (productActivity) => productActivity.product)
  activities!: ProductActivity[];

  /** All files regarding this product */
  @OneToMany(() => ProductFile, (file) => file.product)
  files!: ProductFile[];

  /** Optional ProductPricing object */
  @OneToOne(() => ProductPricing, (pricing) => pricing.product)
  pricing?: ProductPricing;
}
