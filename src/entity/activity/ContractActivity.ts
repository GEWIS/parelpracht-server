import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Contract } from '../Contract';
import { ContractStatus } from '../enums/ContractStatus';

@Entity()
export class ContractActivity extends BaseActivity {
  @Column({ type: 'integer' })
  contractId!: number;

  /** Contract related to this activity */
  @ManyToOne(() => Contract, (contract) => contract.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  /** Subtype of this activity, only used when the type = "STATUS" */
  @Column({
    type: 'enum',
    enum: ContractStatus,
    nullable: true,
  })
  subType?: ContractStatus;
}
