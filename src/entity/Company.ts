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
// eslint-disable-next-line import/no-cycle
import { CompanyFile } from './file/CompanyFile';
import { CompanyStatus } from './enums/CompanyStatus';

@Entity()
export class Company extends BaseEnt {
  /** Name of the company */
  @Column()
  name!: string;

  @Column()
  addressStreet!: string;

  @Column()
  addressPostalCode!: string;

  @Column()
  addressCity!: string;

  @Column()
  addressCountry!: string;

  @Column({ default: '' })
  invoiceAddressStreet!: string;

  @Column({ default: '' })
  invoiceAddressPostalCode!: string;

  @Column({ default: '' })
  invoiceAddressCity!: string;

  @Column({ default: '' })
  invoiceAddressCountry!: string;

  /** Status of the collaboration with this company */
  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  status!: CompanyStatus;

  /** General phone number of the company */
  @Column({ default: '' })
  phoneNumber?: string;

  /** Optional filename of a logo image */
  @Column({ default: '' })
  logoFilename!: string;

  /** Comments regarding the company */
  @Column({ type: 'text', default: '' })
  comments?: string;

  /** All contracts related to this company */
  @OneToMany(() => Contract, (contract) => contract.company)
  contracts!: Contract[];

  /** All invoices related to this company */
  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices!: Invoice[];

  /** All contact persons related to this company */
  @OneToMany(() => Contact, (contact) => contact.company)
  contacts!: Contact[];

  /** All updates / activities regarding this company */
  @OneToMany(() => CompanyActivity, (companyActivity) => companyActivity.company)
  activities!: CompanyActivity[];

  /** All files regarding this company */
  @OneToMany(() => CompanyFile, (file) => file.company)
  files!: CompanyFile[];
}
