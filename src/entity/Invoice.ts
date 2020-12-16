import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from './ProductInstance';
// eslint-disable-next-line import/no-cycle
import { Status } from './Status';

// TODO: Complete status
export enum InvoiceStatus {
  WAITING = 'WAITING',
  SENT = 'SENT',
  COLLECTED = 'COLLECTED',
  UNCOLLECTIBLE = 'UNCOLLECTIBLE',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @OneToMany(() => ProductInstance, (productInstance) => productInstance.invoice)
  products!: ProductInstance[];

  @Column({ type: 'int' })
  companyId!: number;

  @ManyToOne(() => Company, (company) => company.invoices)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column()
  price!: number;

  @Column('text')
  comment!: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.WAITING,
  })
  status!: InvoiceStatus;

  @OneToMany(() => Status, (status) => status.invoice)
  statusChanges!: Status[];

  // TODO: Add files
}
