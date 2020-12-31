import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Contract } from '../Contract';

@Entity()
export class ContractActivity extends BaseActivity {
  @Column({ type: 'integer' })
  contractId!: number;

  /** Contract related to this activity */
  @ManyToOne(() => Contract, (contract) => contract.activities)
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  @Column({ type: 'integer', nullable: true })
  relatedContractId?: number;

  /** If this activity should reference another contract, it can be done here */
  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'relatedContractId' })
  relatedContract?: Contract;
}
