import { getRepository, Repository } from 'typeorm';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { ContractActivity, ContractStatus } from '../entity/activity/ContractActivity';
import { InvoiceActivity, InvoiceStatus } from '../entity/activity/InvoiceActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import { ProductInstanceActivity, ProductInstanceStatus } from '../entity/activity/ProductInstanceActivity';
import { ApiError, HTTPStatus } from '../helpers/error';
import { User } from '../entity/User';

export interface ActivityParams {
  description: string;
}

export interface FullActivityParams extends ActivityParams {
  entityId: number;
  type: ActivityType;
  subType?: any;
}

export interface ContractStatusParams extends ActivityParams {
  subType: ContractStatus,
}

export interface InvoiceStatusParams extends ActivityParams {
  subType: InvoiceStatus,
}

export interface ProductInstanceStatusParams extends ActivityParams {
  subType: ProductInstanceStatus,
}

// export interface FullContractStatusParams extends FullActivityParams, ContractStatusParams {}
//
// export interface FullInvoiceStatusParams extends FullActivityParams, InvoiceStatusParams {}
//
// export interface FullProductInstanceStatusParams extends FullActivityParams,
//   ProductInstanceStatusParams {}

export default class ActivityService {
  repo: Repository<BaseActivity>;

  /** Child class of BaseActivity */
  EntityActivity: typeof BaseActivity;

  /** Represents the logged in user, performing an operation */
  actor?: User;

  constructor(EntityActivity: typeof BaseActivity, options?: { actor?: User }) {
    this.EntityActivity = EntityActivity;
    this.repo = getRepository(EntityActivity);
    this.actor = options?.actor;
  }

  validateActivity(activity: any, entityId: number): any {
    if (activity === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Activity not found');
    }
    switch (this.EntityActivity) {
      case CompanyActivity:
        if (activity.companyId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'Activity does not belong to this company'); }
        break;
      case ContractActivity:
        if (activity.contractId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'Activity does not belong to this contract'); }
        break;
      case InvoiceActivity:
        if (activity.invoiceId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'Activity does not belong to this invoice'); }
        break;
      case ProductActivity:
        if (activity.productId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'Activity does not belong to this product'); }
        break;
      case ProductInstanceActivity:
        if (activity.productInstanceId !== entityId) { throw new ApiError(HTTPStatus.BadRequest, 'Activity does not belong to this productInstance'); }
        break;
      default:
        throw new TypeError(`Type ${this.EntityActivity.constructor.name} is not a valid entity activity`);
    }

    return activity!;
  }

  async createActivity(params: FullActivityParams): Promise<BaseActivity> {
    // @ts-ignore
    let activity = new this.EntityActivity();
    activity = {
      ...activity,
      description: params.description,
      type: params.type,
      subType: params.subType,
      createdBy: this.actor,
    };

    switch (this.EntityActivity) {
      case CompanyActivity:
        activity.companyId = params.entityId;
        break;
      case ContractActivity:
        activity.contractId = params.entityId;
        break;
      case InvoiceActivity:
        activity.invoiceId = params.entityId;
        break;
      case ProductActivity:
        activity.productId = params.entityId;
        break;
      case ProductInstanceActivity:
        activity.productInstanceId = params.entityId;
        break;
      default:
        throw new TypeError(`Type ${this.EntityActivity.constructor.name} is not a valid entity activity`);
    }
    return this.repo.save(activity);
  }

  async updateActivity(
    entityId: number, activityId: number, params: Partial<ActivityParams>,
  ): Promise<BaseActivity> {
    let activity = await this.repo.findOne(activityId);
    activity = this.validateActivity(activity, entityId);
    let p: object;
    switch (this.EntityActivity) {
      case ContractActivity:
        p = {
          description: params.description,
        };
        break;
      case InvoiceActivity:
        p = {
          description: params.description,
        };
        break;
      default:
        p = {
          description: params.description,
        };
    }

    await this.repo.update(activity!.id, p);
    activity = await this.repo.findOne(activityId);
    return activity!;
  }

  async deleteActivity(entityId: number, activityId: number): Promise<void> {
    let activity = await this.repo.findOne(activityId);
    activity = this.validateActivity(activity, entityId);
    await this.repo.delete(activity!.id);
  }
}
