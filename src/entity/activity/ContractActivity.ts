import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { Contract } from '../Contract';
import { ContractStatus } from '../enums/ContractStatus';
import { BaseEnt } from '../BaseEnt';
import { ApiError, HTTPStatus } from '../../helpers/error';

@Entity()
export class ContractActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
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
    update: false,
  })
  subType?: ContractStatus;

  getRelatedEntity(): BaseEnt {
    return this.contract;
  }

  getRelatedEntityId(): number {
    return this.contractId;
  }

  setRelatedEntityId(id: number): void {
    this.contractId = id;
  }

  setSubType(subType: ContractStatus): void {
    if (subType !== undefined && !Object.values(ContractStatus).includes(subType)) {
      throw new ApiError(HTTPStatus.BadRequest, `${subType} is not a valid ContractStatus`);
    }
    this.subType = subType;
  }
}
