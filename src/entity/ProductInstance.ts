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
  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn()
  product!: Product;

  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn()
  contract!: Contract;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn()
  invoice?: Invoice;

  @OneToMany(() => ProductInstanceActivity,
    (productInstanceActivity) => productInstanceActivity.productInstance)
  @JoinColumn()
  productInstanceActivities!: ProductActivity[];

  @Column()
  price!: number;

  @Column({ nullable: true })
  comment?: string;
}
