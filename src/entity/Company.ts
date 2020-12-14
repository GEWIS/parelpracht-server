import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Agreement } from './Agreement';

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

  @OneToMany(() => Agreement, (agreement) => agreement.company)
  agreements!: Agreement[];

  // TODO: add contact persons
}
