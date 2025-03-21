import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { Product } from './Product';

@Entity()
export class ProductCategory extends BaseEnt {
  /** Name of the product category */
  @Column()
  name!: string;

  /** All products in this category */
  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
