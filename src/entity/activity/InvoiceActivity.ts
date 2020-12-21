import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';

@Entity()
export class InvoiceActivity extends BaseActivity {
  @Column({ type: 'integer' })
  invoiceId!: number;

  /** Invoice related to this activity */
  @ManyToOne(() => Invoice, (invoice) => invoice.products)
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @Column({ type: 'integer' })
  relatedInvoiceId?: number;

  /** If this activity should reference another invoice, it can be done here */
  @ManyToOne(() => Invoice, (invoice) => invoice.products)
  @JoinColumn({ name: 'relatedInvoiceId' })
  relatedInvoice?: Invoice;
}
