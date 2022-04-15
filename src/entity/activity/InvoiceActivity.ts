import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '../Invoice';
import { InvoiceStatus } from '../enums/InvoiceStatus';
import { BaseEnt } from '../BaseEnt';
import { ApiError, HTTPStatus } from '../../helpers/error';

@Entity()
export class InvoiceActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  invoiceId!: number;

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
  subType?: InvoiceStatus;

  getRelatedEntity(): BaseEnt {
    return this.invoice;
  }

  getRelatedEntityId(): number {
    return this.invoiceId;
  }

  setRelatedEntityId(id: number): void {
    this.invoiceId = id;
  }

  setSubType(subType: InvoiceStatus): void {
    if (subType !== undefined && !Object.values(InvoiceStatus).includes(subType)) {
      throw new ApiError(HTTPStatus.BadRequest, `${subType} is not a valid InvoiceStatus`);
    }
    this.subType = subType;
  }
}
