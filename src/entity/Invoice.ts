import {
  Column, Entity, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from './ProductInstance';
// eslint-disable-next-line import/no-cycle
import { InvoiceActivity } from './activity/InvoiceActivity';

@Entity()
export class Invoice extends BaseEnt {
  /** All products that have been invoiced */
  @OneToMany(() => ProductInstance, (productInstance) => productInstance.invoice)
  products!: ProductInstance[];

  /** The company this invoice will be send to */
  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;

  /** PO number on the invoice, if needed */
  @Column({ default: '' })
  poNumber?: string;

  /** Any comments regarding this invoice */
  @Column({ type: 'text' })
  comment?: string;

  /** All activities regarding this invoice */
  @OneToMany(() => InvoiceActivity, (invoiceActivity) => invoiceActivity.invoice)
  invoiceActivities!: InvoiceActivity[];

  // TODO: Add files
}
