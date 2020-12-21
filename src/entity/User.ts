import {
  Column,
  Entity, JoinTable, ManyToMany,
} from 'typeorm';
import { BaseEnt } from './BaseEnt';
// eslint-disable-next-line import/no-cycle
import { Role } from './Role';
// // eslint-disable-next-line import/no-cycle
// import { CompanyActivity } from './activity/CompanyActivity';
// // eslint-disable-next-line import/no-cycle
// import { ContractActivity } from './activity/ContractActivity';
// // eslint-disable-next-line import/no-cycle
// import { InvoiceActivity } from './activity/InvoiceActivity';
// // eslint-disable-next-line import/no-cycle
// import { ProductActivity } from './activity/ProductActivity';
// // eslint-disable-next-line import/no-cycle
// import { ProductInstanceActivity } from './activity/ProductInstanceActivity';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

@Entity()
export class User extends BaseEnt {
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

  @Column()
  email!: string;

  @Column({ type: 'text', default: '' })
  comment?: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles!: Role[];

  // @OneToMany(() => CompanyActivity, (activity) => activity.createdBy)
  // companyActivities!: CompanyActivity[];
  //
  // @OneToMany(() => ContractActivity, (activity) => activity.createdBy)
  // contractActivity!: ContractActivity[];
  //
  // @OneToMany(() => InvoiceActivity, (activity) => activity.createdBy)
  // invoiceActivities!: InvoiceActivity[];
  //
  // @OneToMany(() => ProductActivity, (activity) => activity.createdBy)
  // productActivities!: ProductActivity[];
  //
  // @OneToMany(() => ProductInstanceActivity, (activity) => activity.createdBy)
  // productInstanceActivities!: CompanyActivity[];
}
