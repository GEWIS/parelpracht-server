import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Contract } from '../Contract';
import BaseFile from './BaseFile';

@Entity()
export class ContractFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly contractId!: number;

  /** Contract related to this file */
  @ManyToOne(() => Contract, (contract) => contract.files)
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;
}
