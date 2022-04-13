import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import BaseActivity from './BaseActivity';
// eslint-disable-next-line import/no-cycle
import { ProductInstance } from '../ProductInstance';
import { ProductInstanceStatus } from '../enums/ProductActivityStatus';
import { BaseEnt } from '../BaseEnt';
import { ApiError, HTTPStatus } from '../../helpers/error';

@Entity()
export class ProductInstanceActivity extends BaseActivity {
  @Column({ type: 'integer', update: false })
  productInstanceId!: number;

  /** ProductInstance related to this activity */
  @ManyToOne(() => ProductInstance, (productInstance) => productInstance.activities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productInstanceId' })
  productInstance!: ProductInstance;

  /** Subtype of this activity, only used when the type = "STATUS" */
  @Column({
    type: 'enum',
    enum: ProductInstanceStatus,
    nullable: true,
    update: false,
  })
  subType?: ProductInstanceStatus;

  getRelatedEntity(): BaseEnt {
    return this.productInstance;
  }

  getRelatedEntityId(): number {
    return this.productInstanceId;
  }

  setRelatedEntityId(id: number): void {
    this.productInstanceId = id;
  }

  setSubType(subType: ProductInstanceStatus): void {
    if (subType !== undefined && !Object.values(ProductInstanceStatus).includes(subType)) {
      throw new ApiError(HTTPStatus.BadRequest, `${subType} is not a valid ProductInstanceStatus`);
    }
    this.subType = subType;
  }
}
