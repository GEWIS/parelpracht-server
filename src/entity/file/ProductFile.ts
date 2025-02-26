import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from '../Product';
import BaseFile from './BaseFile';

@Entity()
export class ProductFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly productId!: number;

  /** Invoice related to this file */
  @ManyToOne(() => Product, (product) => product.files)
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
