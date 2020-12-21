import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Contract } from '../Contract';

@Entity()
export class ContractActivity extends BaseActivity {
  /** Contract related to this activity */
  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn()
  contract!: Contract;

  /** If this activity should reference another contract, it can be done here */
  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn()
  relatedContract!: Contract;
}
