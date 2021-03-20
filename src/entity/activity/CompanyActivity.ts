import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Company } from '../Company';

@Entity()
export class CompanyActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  readonly companyId!: number;

  /** Company related to this activity */
  @ManyToOne(() => Company, (company) => company.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
