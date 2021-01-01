import { getRepository, Repository } from 'typeorm';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { ContractActivity, ContractStatus } from '../entity/activity/ContractActivity';
import { InvoiceActivity, InvoiceStatus } from '../entity/activity/InvoiceActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import { ProductInstanceActivity, ProductInstanceStatus } from '../entity/activity/ProductInstanceActivity';
import { ApiError, HTTPStatus } from '../helpers/error';
import { User } from '../entity/User';
// eslint-disable-next-line import/no-cycle
import ProductInstanceService from './ProductInstanceService';
// eslint-disable-next-line import/no-cycle
import ContractService from './ContractService';
import { Contract } from '../entity/Contract';

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

  /**
   * Validate the activity object: does it belong to the requested entity and is it not null
   * @param activity Activity object
   * @param entityId ID of an entity (e.g. contract, invoice, company, etc)
   */
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

  /**
   * Get an array of Status-enums belonging to the given entity
   * @param entity Object containing the Many-To-One column to search on, e.g. { contractId: 1 }
   */
  async getStatuses(entity: object): Promise<Array<any>> {
    // @ts-ignore
    const activities = await this.repo.find({
      select: ['subType'],
      where: {
        ...entity,
        type: ActivityType.STATUS,
      },
    });

    // @ts-ignore
    return activities.map((activity) => activity.subType);
  }

  private async canEndContract(contract: Contract):
  Promise<{ cancelled: boolean, finished: boolean, }> {
    let cancelled = true;
    let finished = true;

    await Promise.all(contract.products.map(async (p) => {
      // Get all statuses of this product instance
      const statuses = <Array<ProductInstanceStatus>>
        (await new ActivityService(ProductInstanceActivity)
          .getStatuses({ productInstanceId: p.id }));
      // If the statuses include delivered, the contract cannot be cancelled anymore
      if (statuses.includes(ProductInstanceStatus.DELIVERED)) {
        cancelled = false;
        // If the statuses include not delivered or deferred, the contract cannot be finished
      } else if (statuses.includes(ProductInstanceStatus.NOTDELIVERED)
        || statuses.includes(ProductInstanceStatus.DEFERRED)
      ) {
        cancelled = false;
        finished = false;
      }
    }));

    return { cancelled, finished };
  }

  /**
   * Check all productInstances of a contract whether they are delivered or cancelled. If they are,
   * create a new contract status: delivered or cancelled respectively.
   * @param contractId ID of the contract
   */
  private async endContractIfPossible(contractId: number): Promise<boolean> {
    const contract = await new ContractService().getContract(contractId);

    const canEndContract = await this.canEndContract(contract);

    if (canEndContract.cancelled) {
      await new ActivityService(ContractActivity, { actor: this.actor }).createActivity({
        entityId: contractId,
        description: '',
        type: ActivityType.STATUS,
        subType: ContractStatus.CANCELLED,
      } as FullActivityParams);
      return true;
    }
    if (canEndContract.finished) {
      await new ActivityService(ContractActivity, { actor: this.actor }).createActivity({
        entityId: contractId,
        description: '',
        type: ActivityType.STATUS,
        subType: ContractStatus.FINISHED,
      } as FullActivityParams);
      return true;
    }
    return false;
  }

  /**
   * Create an activity object with a lot of validation
   * @param params Parameters to create an activity with
   */
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

    let statusParam = {};

    switch (this.EntityActivity) {
      case CompanyActivity:
        activity.companyId = params.entityId;
        break;
      case ProductActivity:
        activity.productId = params.entityId;
        break;
      case ContractActivity:
        activity.contractId = params.entityId;
        statusParam = { contractId: params.entityId };

        // The rest of the code is validating the to-be status
        if (activity.type !== ActivityType.STATUS) {
          break;
        }

        // eslint-disable-next-line no-case-declarations
        const contract = await new ContractService().getContract(activity.contractId);
        // eslint-disable-next-line no-case-declarations
        const canEndContract = await this.canEndContract(contract);
        // eslint-disable-next-line no-case-declarations
        const statuses = await this.getStatuses({ contractId: activity.contractId });

        if (!canEndContract.cancelled && activity.subType === ContractStatus.CANCELLED) {
          throw new ApiError(HTTPStatus.BadRequest, 'Cannot cancel contract, because not all products are cancelled');
        }
        if (canEndContract.cancelled && activity.subType === ContractStatus.FINISHED) {
          throw new ApiError(HTTPStatus.BadRequest, 'Cannot finish contract, because all products are cancelled. Cancel the contract instead');
        }
        if (!canEndContract.finished && activity.subType === ContractStatus.FINISHED) {
          throw new ApiError(HTTPStatus.BadRequest, 'Cannot finish contract, because not all products are either finished or cancelled');
        }
        if (statuses.includes(ContractStatus.FINISHED)
          || statuses.includes(ContractStatus.CANCELLED)) {
          throw new ApiError(HTTPStatus.BadRequest, 'Cannot change the status of this contract, because the contract is already finished or cancelled');
        }
        if (statuses.includes(ContractStatus.CONFIRMED)
          && (activity.subType !== ContractStatus.FINISHED
            || activity.subType !== ContractStatus.CANCELLED)) {
          throw new ApiError(HTTPStatus.BadRequest, 'Contract is already confirmed by both parties');
        }
        if (statuses.includes(ContractStatus.SENT)
          && activity.subType === ContractStatus.PROPOSED) {
          throw new ApiError(HTTPStatus.BadRequest, 'Contract is already sent');
        }

        break;
      case InvoiceActivity:
        activity.invoiceId = params.entityId;
        statusParam = { invoiceId: params.entityId };
        break;
      case ProductInstanceActivity:
        activity.productInstanceId = params.entityId;
        statusParam = { productInstanceId: params.entityId };

        // The rest of the code is validating the to-be status
        if (activity.type !== ActivityType.STATUS) {
          break;
        }

        // If we want to set the status to delivered or cancelled, we need to do some validation
        if (params.subType === ProductInstanceStatus.DELIVERED
          || params.subType === ProductInstanceStatus.CANCELLED
        ) {
          const prodIns = await new ProductInstanceService().getProduct(activity.productInstanceId);

          // Verify that the contract that belongs to this prodInstance, has the status "confirmed"
          if (!(await new ActivityService(ContractActivity)
            .getStatuses({ contractId: prodIns.contractId })).includes(ContractStatus.CONFIRMED)
          ) {
            throw new ApiError(HTTPStatus.BadRequest, 'Contract has not yet been confirmed! Please do this first');
          }
        }
        break;
      default:
        throw new TypeError(`Type ${this.EntityActivity.constructor.name} is not a valid entity activity`);
    }

    // If the activity is a status, verify that it's unique for this entity
    if (params.type === ActivityType.STATUS
      && (await this.getStatuses(statusParam)).includes(activity.subType)
    ) {
      throw new ApiError(HTTPStatus.BadRequest, `Given entity already has or had status ${activity.subType}`);
    }

    // Save the activity to the database
    activity = await this.repo.save(activity);

    // If the status of a ProductInstance was changed, check whether we can also update the contract
    if (this.EntityActivity === ProductInstanceActivity && activity.type === ActivityType.STATUS) {
      const prodInst = await new ProductInstanceService().getProduct(activity.productInstanceId);
      await this.endContractIfPossible(prodInst.contractId);
    }

    return activity;
  }

  /**
   * Update an activity object
   * @param entityId ID of the related entity
   * @param activityId ID of the activity
   * @param params Subset of update parameters
   */
  async updateActivity(
    entityId: number, activityId: number, params: Partial<ActivityParams>,
  ): Promise<BaseActivity> {
    let activity = await this.repo.findOne(activityId);
    activity = this.validateActivity(activity, entityId);
    let p: object;
    switch (this.EntityActivity) {
      case ContractActivity:
        p = { description: params.description };
        break;
      case InvoiceActivity:
        p = { description: params.description };
        break;
      default:
        p = { description: params.description };
    }

    await this.repo.update(activity!.id, p);
    activity = await this.repo.findOne(activityId);
    return activity!;
  }

  /**
   * Delete an activity object
   * @param entityId ID of the related entity
   * @param activityId ID of the activity
   */
  async deleteActivity(entityId: number, activityId: number): Promise<void> {
    let activity = await this.repo.findOne(activityId);
    activity = this.validateActivity(activity, entityId);
    await this.repo.delete(activity!.id);
  }
}
