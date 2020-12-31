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
// eslint-disable-next-line import/no-cycle
import { InvoiceFile } from './file/InvoiceFile';
import { User } from './User';

@Entity()
export class Invoice extends BaseEnt {
  /** All products that have been invoiced */
  @OneToMany(() => ProductInstance, (productInstance) => productInstance.invoice)
  products!: ProductInstance[];

  /** PO number on the invoice, if needed */
  @Column({ default: '' })
  poNumber?: string;

  /** Any comments regarding this invoice */
  @Column({ type: 'text', default: '' })
  comments?: string;

  @Column({ type: 'integer' })
  companyId!: number;

  @Column({ type: 'integer' })
  createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'integer', nullable: true })
  assignedToId!: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User;

  /** Company this invoice is directed to */
  @ManyToOne(() => Company, (company) => company.invoices)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /** All activities regarding this invoice */
  @OneToMany(() => InvoiceActivity, (invoiceActivity) => invoiceActivity.invoice)
  activities!: InvoiceActivity[];

  /** All files regarding this contract */
  @OneToMany(() => InvoiceFile, (file) => file.invoice)
  files!: InvoiceFile[];
}
