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
  @OneToMany(() => ProductInstance, (productInstance) => productInstance.invoice)
  products!: ProductInstance[];

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;

  @Column({ default: '' })
  poNumber?: string;

  @Column()
  price!: number;

  @Column({ type: 'text' })
  comment?: string;

  @OneToMany(() => InvoiceActivity, (invoiceActivity) => invoiceActivity.invoice)
  invoiceActivities!: InvoiceActivity[];

  // TODO: Add files
}
