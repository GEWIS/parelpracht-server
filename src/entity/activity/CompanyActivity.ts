import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Company } from '../Company';
import { BaseEnt } from '../BaseEnt';

@Entity()
export class CompanyActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  companyId!: number;

  /** Company related to this activity */
  @ManyToOne(() => Company, (company) => company.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  getRelatedEntity(): BaseEnt {
    return this.company;
  }

  getRelatedEntityId(): number {
    return this.companyId;
  }

  setRelatedEntityId(id: number): void {
    this.companyId = id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSubType(subType: string): void {}
}
