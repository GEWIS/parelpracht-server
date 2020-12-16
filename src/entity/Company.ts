import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Contact } from './Contact';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Invoice } from './Invoice';
// eslint-disable-next-line import/no-cycle
import { Status } from './Status';

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Company {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column()
  phoneNumber!: string;

  @Column('text')
  comments!: string;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  status!: CompanyStatus;

  @UpdateDateColumn()
  lastUpdated!: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @OneToMany(() => Contract, (contract) => contract.company)
  contracts!: Contract[];

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices!: Invoice[];

  @OneToMany(() => Contact, (contact) => contact.company)
  contacts!: Contact[];

  @OneToMany(() => Status, (status) => status.company)
  statusChanges!: Status[];
}
