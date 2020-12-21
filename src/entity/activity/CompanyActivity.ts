import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Company } from '../Company';

@Entity()
export class CompanyActivity extends BaseActivity {
  /** Company related to this activity */
  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn()
  company!: Company;
}
