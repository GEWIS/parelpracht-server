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
  @Column()
  title!: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;

  @OneToMany(() => ProductInstance, (productInstance) => productInstance.contract)
  @JoinTable()
  products!: ProductInstance[];

  @ManyToOne(() => Contact, (contact) => contact.contracts)
  @JoinColumn()
  contact!: Contact;

  @Column({ type: 'text', default: '' })
  comments?: string;

  @OneToMany(() => ContractActivity, (contractActivity) => contractActivity.contract)
  contractActivity!: ContractActivity[];

  // TODO: add files
}
