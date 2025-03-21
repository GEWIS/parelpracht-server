import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from '../Product';
import { BaseEnt } from '../BaseEnt';
import BaseActivity from './BaseActivity';

@Entity()
export class ProductActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  productId!: number;

  /** Product related to this activity */
  @ManyToOne(() => Product, (product) => product.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  public getRelatedEntity(): BaseEnt {
    return this.product;
  }

  public getRelatedEntityId(): number {
    return this.productId;
  }

  public setRelatedEntityId(id: number): void {
    this.productId = id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setSubType(subType: string) {}
}
