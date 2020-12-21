import { Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Contract } from '../Contract';

@Entity()
export class ContractActivity extends BaseActivity {
  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn()
  contract!: Contract;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn()
  relatedContract!: Contract;
}
