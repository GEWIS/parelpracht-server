import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Invoice } from './Invoice';
// eslint-disable-next-line import/no-cycle
import { Product } from './Product';

// TODO: Complete status
export enum ProductInstanceStatus {
  WAITING = 'WAITING',
  DELIVERED = 'DELIVERED',
  NOT_DELIVERED = 'NOT_DELIVERED',
}

@Entity()
export class ProductInstance {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, (product) => product.instances)
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'int' })
  contractId!: number;

  @ManyToOne(() => Contract, (contract) => contract.products)
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  @Column({ type: 'int' })
  invoiceId!: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.products)
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @Column()
  price!: number;

  @Column('text')
  comment!: string;

  @Column({
    type: 'enum',
    enum: ProductInstanceStatus,
    default: ProductInstanceStatus.WAITING,
  })
  status!: ProductInstanceStatus;
}
