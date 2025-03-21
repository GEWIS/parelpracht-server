import { Column, Entity, JoinTable, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { BaseEnt } from './BaseEnt';
import { Company } from './Company';
import { Contact } from './Contact';
import { ContractActivity } from './activity/ContractActivity';
import { ProductInstance } from './ProductInstance';
import { ContractFile } from './file/ContractFile';
import { User } from './User';

@Entity()
export class Contract extends BaseEnt {
  /** Title or name of this contract/collaboration */
  @Column()
  title!: string;

  @Column({ type: 'integer', update: false })
  readonly companyId!: number;

  /** Company this contract has been closed with */
  @ManyToOne(() => Company, (company) => company.contracts)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /** All products in the contract */
  @OneToMany(() => ProductInstance, (productInstance) => productInstance.contract)
  @JoinTable()
  products!: ProductInstance[];

  @Column({ type: 'integer', update: false })
  readonly createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column({ type: 'integer', nullable: true })
  assignedToId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User;

  @Column({ type: 'integer' })
  contactId!: number;

  /** Comments regarding this contract, if there are any */
  @Column({ type: 'text', default: '' })
  comments?: string;

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
