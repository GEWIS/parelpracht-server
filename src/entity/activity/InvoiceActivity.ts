import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';

@Entity()
export class InvoiceActivity extends BaseActivity {
  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn()
  invoice!: Invoice;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn()
  relatedInvoice!: Invoice;
}
