import {
  Column, Entity, OneToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { VAT } from './enums/ValueAddedTax';
import { Product } from './Product';

@Entity()
export class ValueAddedTax extends BaseEnt {
  /** VAT category */
  @Column({
    type: 'enum',
    enum: VAT,
    default: VAT.HIGH,
  })
  category!: VAT;

  /** Price is stored * 100 and as integer */
  @Column({ type: 'integer' })
  amount!: number;

  /** All products in this category */
  @OneToMany(() => Product, (product) => product.valueAddedTax)
  products!: Product[];
}
