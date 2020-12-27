import { getRepository, Repository } from 'typeorm';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { ContractActivity } from '../entity/activity/ContractActivity';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { ApiError, HTTPStatus } from '../helpers/error';
import UserService from './UserService';

export interface UpdateActivityParams {
  description: string;
  relatedEntityId?: number;
}

export interface CommentParams extends UpdateActivityParams {
  createdById: number;
}

export interface StatusParams extends CommentParams {
  subtype: string;
}

export interface FullActivityParams extends StatusParams {
  entityId: number;
  type: ActivityType;
}

export default class ActivityService {
  repo: Repository<BaseActivity>;

  EntityActivity: typeof BaseActivity;

  constructor(EntityActivty: typeof BaseActivity) {
    this.EntityActivity = EntityActivty;
    this.repo = getRepository(EntityActivty);
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
    const user = new UserService().getUser(params.createdById);
    // @ts-ignore
    let activity = new this.EntityActivity();
    activity = {
      ...activity,
      description: params.description,
      type: params.type,
      subType: params.subtype,
      createdBy: user,
    };

    switch (this.EntityActivity) {
      case CompanyActivity:
        activity.companyId = params.entityId;
        break;
      case ContractActivity:
        activity.contractId = params.entityId;
        activity.relatedContractId = params.relatedEntityId;
        break;
      case InvoiceActivity:
        activity.invoiceId = params.entityId;
        activity.relatedInvoiceId = params.relatedEntityId;
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
    console.log(activity);
    return this.repo.save(activity);
  }

  async updateActivity(
    entityId: number, activityId: number, params: Partial<UpdateActivityParams>,
  ): Promise<BaseActivity> {
    let activity = await this.repo.findOne(activityId);
    activity = this.validateActivity(activity, entityId);
    let p: object;
    switch (this.EntityActivity) {
      case ContractActivity:
        p = {
          description: params.description,
          relatedContractId: params.relatedEntityId,
        };
        break;
      case InvoiceActivity:
        p = {
          description: params.description,
          relatedInvoiceId: params.relatedEntityId,
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
