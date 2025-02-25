import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Invoice } from '../Invoice';
import BaseFile from './BaseFile';
// eslint-disable-next-line import/no-cycle

@Entity()
export class InvoiceFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly invoiceId!: number;

  /** Invoice related to this file */
  @ManyToOne(() => Invoice, (invoice) => invoice.files)
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;
}
