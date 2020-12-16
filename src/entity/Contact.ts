import {
  Column,
  Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Company } from './Company';
// eslint-disable-next-line import/no-cycle
import { Contract } from './Contract';
// eslint-disable-next-line import/no-cycle
import { Status } from './Status';
// eslint-disable-next-line import/no-cycle
import { Gender } from './User';

export enum ContactFunction {
  NORMAL = 'NORMAL',
  PRIMARY = 'PRIMARY',
  FINANCIAL = 'FINANCIAL',
  OLD = 'OLD',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
  })
  gender!: Gender;

  @Column()
  firstName!: string;

  @Column()
  middleName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column('text')
  comment!: string;

  @Column({ type: 'int' })
  companyId!: number;

  @Column({ type: 'enum', enum: ContactFunction, default: ContactFunction.NORMAL })

  @ManyToOne(() => Company, (company) => company.contacts)
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @ManyToMany(() => Contract, (contract) => contract.contact)
  contracts!: Contract[];

  @OneToMany(() => Status, (status) => status.contract)
  statusChanges!: Status[];
}
