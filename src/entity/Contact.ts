import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Gender } from './User';

export enum ContactFunction {
  NORMAL = 'NORMAL',
  PRIMARY = 'PRIMARY',
  FINANCIAL = 'FINANCIAL',
  OLD = 'OLD',
}

@Entity()
export class Contact extends BaseEnt {
  /** The gender of this contact */
  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender!: Gender;

  /** The first name of the contact */
  @Column()
  firstName!: string;

  /** The middle name of the contact, if he/she has one */
  @Column({ default: '' })
  middleName?: string;

  /** The last name of the contact */
  @Column()
  lastName!: string;

  /** The (personal) email address of the contact */
  @Column({ default: '' })
  email?: string;

  /** The (personal) phone number of the contact */
  @Column({ default: '' })
  telephone?: string;

  /** Comments regarding the contact person, if there are any */
  @Column({ type: 'text', default: '' })
  comment?: string;

  /** Function of this contact person within the company, if known. Normal by default. */
  @Column({ type: 'enum', enum: ContactFunction, default: ContactFunction.NORMAL })
  function?: ContactFunction;

  /** Company this contact person works at */
  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;

  /** All contracts that have been closed with this contact person */
  @OneToMany(() => Contract, (contract) => contract.contact)
  contracts!: Contract[];
}
