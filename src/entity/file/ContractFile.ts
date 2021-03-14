import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import BaseFile from './BaseFile';
// eslint-disable-next-line import/no-cycle
import { Contract } from '../Contract';

@Entity()
export class ContractFile extends BaseFile {
  @Column({ type: 'integer', update: false })
  readonly contractId!: number;

  /** Contract related to this file */
  @ManyToOne(() => Contract, (contract) => contract.files)
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;
}
