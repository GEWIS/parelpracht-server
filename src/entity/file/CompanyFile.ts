import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import BaseFile from './BaseFile';
// eslint-disable-next-line import/no-cycle
import { Company } from '../Company';

@Entity()
export class CompanyFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly companyId!: number;

  /** Company related to this file */
  @ManyToOne(() => Company, (company) => company.files)
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
