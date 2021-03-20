import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';
import { InvoiceStatus } from '../enums/InvoiceStatus';

@Entity()
export class InvoiceActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  readonly invoiceId!: number;

  /** Invoice related to this activity */
  @ManyToOne(() => Invoice, (invoice) => invoice.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  /** Subtype of this activity, only used when the type = "STATUS" */
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    nullable: true,
    update: false,
  })
  readonly subType?: InvoiceStatus;
}
