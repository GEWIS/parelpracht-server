import {
  Column, Entity, OneToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { Contact } from './Contact';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Invoice } from './Invoice';
// eslint-disable-next-line import/no-cycle
import { CompanyActivity } from './activity/CompanyActivity';

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Company extends BaseEnt {
  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ default: '' })
  phoneNumber?: string;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  status!: CompanyStatus;

  @Column({ nullable: true })
  endDate?: Date;

  @OneToMany(() => Contract, (contract) => contract.company)
  contracts!: Contract[];

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices!: Invoice[];

  @OneToMany(() => Contact, (contact) => contact.company)
  contacts!: Contact[];

  @OneToMany(() => CompanyActivity, (companyActivity) => companyActivity.company)
  activities!: CompanyActivity[];
}
