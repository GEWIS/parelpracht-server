import {
  Column,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { Contact } from './Contact';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Invoice } from './Invoice';
// eslint-disable-next-line import/no-cycle
import { Product } from './Product';
// eslint-disable-next-line import/no-cycle
import { User } from './User';

export enum EntityType {
  NULL = 'NULL',
  USER = 'USER',
  COMPANY = 'COMPANY',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  PRODUCT = 'PRODUCT',
  CONTACT = 'CONTACT',
}

@Entity()
export class Status {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  comment!: string;

  @Column({ type: 'int' })
  createdById!: number;

  @Column({ type: 'enum', enum: EntityType, default: EntityType.NULL })
  entityType!: EntityType;

  @ManyToOne(() => User, (user) => user.madeChanges)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'int', nullable: true })
  companyId!: number;

  @ManyToOne(() => Company, (company) => company.statusChanges, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'int', nullable: true })
  contractId!: number;

  @ManyToOne(() => Contract, (contract) => contract.statusChanges, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  @Column({ type: 'int', nullable: true })
  invoiceId!: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.statusChanges, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @Column({ type: 'int', nullable: true })
  userId!: number;

  @ManyToOne(() => User, (user) => user.statusChanges, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'int', nullable: true })
  productId!: number;

  @ManyToOne(() => Product, (product) => product.statusChanges, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'int', nullable: true })
  contactId!: number;

  @ManyToOne(() => Contact, (contact) => contact.statusChanges, { nullable: true })
  @JoinColumn({ name: 'contactId' })
  contact!: Contact;
}
