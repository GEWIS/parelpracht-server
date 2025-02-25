import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseFile from './BaseFile';
// eslint-disable-next-line import/no-cycle
import { Product } from '../Product';

@Entity()
export class ProductFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly productId!: number;

  /** Invoice related to this file */
  @ManyToOne(() => Product, (product) => product.files)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
