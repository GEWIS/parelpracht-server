import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import BaseFile from './BaseFile';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';

@Entity()
export class InvoiceFile extends BaseFile {
  @Column({ type: 'integer' })
  invoiceId!: number;

  /** Invoice related to this file */
  @ManyToOne(() => Invoice, (invoice) => invoice.files)
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;
}
