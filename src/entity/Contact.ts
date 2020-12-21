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
  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender!: Gender;

  @Column()
  firstName!: string;

  @Column({ default: '' })
  middleName?: string;

  @Column()
  lastName!: string;

  @Column({ default: '' })
  email?: string;

  @Column({ default: '' })
  telephone?: string;

  @Column({ type: 'text', default: '' })
  comment?: string;

  @Column({ type: 'enum', enum: ContactFunction, default: ContactFunction.NORMAL })

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;

  @OneToMany(() => Contract, (contract) => contract.contact)
  contracts!: Contract[];
}
