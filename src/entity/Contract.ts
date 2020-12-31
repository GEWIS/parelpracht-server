import {
  Column, Entity, JoinTable, JoinColumn, OneToMany, ManyToOne,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { Contact } from './Contact';
// eslint-disable-next-line import/no-cycle
import { ContractActivity } from './activity/ContractActivity';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from './ProductInstance';
// eslint-disable-next-line import/no-cycle
import { ContractFile } from './file/ContractFile';
import { User } from './User';

@Entity()
export class Contract extends BaseEnt {
  /** Title or name of this contract/collaboration */
  @Column()
  title!: string;

  /** Comments regarding this contract, if there are any */
  @Column({ type: 'text', default: '' })
  comments?: string;

  @Column({ type: 'integer' })
  companyId!: number;

  /** Company this contract has been closed with */
  @ManyToOne(() => Company, (company) => company.contracts)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /** All products in the contract */
  @OneToMany(() => ProductInstance, (productInstance) => productInstance.contract)
  @JoinTable()
  products!: ProductInstance[];

  @Column({ type: 'integer' })
  createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'integer', nullable: true })
  assignedToId!: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User;

  @Column({ type: 'integer' })
  contactId!: number;

  /** The contact this contract has been closed with */
  @ManyToOne(() => Contact, (contact) => contact.contracts)
  @JoinColumn({ name: 'contactId' })
  contact!: Contact;

  /** All activities regarding this contract */
  @OneToMany(() => ContractActivity, (contractActivity) => contractActivity.contract)
  activities!: ContractActivity[];

  /** All files regarding this contract */
  @OneToMany(() => ContractFile, (file) => file.contract)
  files!: ContractFile[];
}
