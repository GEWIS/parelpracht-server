import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Company } from '../Company';

@Entity()
export class CompanyActivity extends BaseActivity {
  @Column({ type: 'integer' })
  companyId!: number;

  /** Company related to this activity */
  @ManyToOne(() => Company, (company) => company.activities)
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
