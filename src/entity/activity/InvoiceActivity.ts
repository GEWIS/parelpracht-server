import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';

export enum InvoiceStatus {
  CREATED = 'CREATED',
  SENT = 'SENT',
  PAID = 'PAID',
  IRRECOVERABLE = 'IRRECOVERABLE',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class InvoiceActivity extends BaseActivity {
  @Column({ type: 'integer' })
  invoiceId!: number;

  /** Invoice related to this activity */
  @ManyToOne(() => Invoice, (invoice) => invoice.activities)
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  /** Subtype of this activity, only used when the type = "STATUS" */
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    nullable: true,
  })
  subType?: InvoiceStatus;
}
