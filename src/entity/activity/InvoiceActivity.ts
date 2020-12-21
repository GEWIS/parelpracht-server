import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';

@Entity()
export class InvoiceActivity extends BaseActivity {
  /** Invoice related to this activity */
  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn()
  invoice!: Invoice;

  /** If this activity should reference another invoice, it can be done here */
  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn()
  relatedInvoice!: Invoice;
}
