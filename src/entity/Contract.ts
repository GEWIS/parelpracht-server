import {
  Column, Entity, JoinTable, ManyToOne, JoinColumn, OneToMany,
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
  contactId!: number;

  /** The contact this contract has been closed with */
  @ManyToOne(() => Contact, (contact) => contact.contracts)
  @JoinColumn({ name: 'contactId' })
  contact!: Contact;

  /** All activities regarding this contract */
  @OneToMany(() => ContractActivity, (contractActivity) => contractActivity.contract)
  contractActivity!: ContractActivity[];

  // TODO: add files
}
