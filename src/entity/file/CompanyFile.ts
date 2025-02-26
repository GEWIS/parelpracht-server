import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from '../Company';
import BaseFile from './BaseFile';

@Entity()
export class CompanyFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly companyId!: number;

  /** Company related to this file */
  @ManyToOne(() => Company, (company) => company.files)
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
