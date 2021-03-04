import { getRepository, Repository } from 'typeorm';
import BaseActivity from '../entity/activity/BaseActivity';
import { CompanyActivity } from '../entity/activity/CompanyActivity';
import { ContractActivity } from '../entity/activity/ContractActivity';
import { InvoiceActivity } from '../entity/activity/InvoiceActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { ApiError, HTTPStatus } from '../helpers/error';
import { User } from '../entity/User';
// eslint-disable-next-line import/no-cycle
import ProductInstanceService from './ProductInstanceService';
// eslint-disable-next-line import/no-cycle
import ContractService from './ContractService';
import { Contract } from '../entity/Contract';
import { ActivityType } from '../entity/enums/ActivityType';
import { ContractStatus } from '../entity/enums/ContractStatus';
import { InvoiceStatus } from '../entity/enums/InvoiceStatus';
import { ProductInstanceStatus } from '../entity/enums/ProductActivityStatus';
// eslint-disable-next-line import/no-cycle
import { sendInvoiceEmails } from '../helpers/mailBuilder';
import { appendProductActivityDescription, createAddProductActivityDescription } from '../helpers/activity';

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

  async getActivity(id: number, relations: string[] = []): Promise<BaseActivity> {
    const activity = await this.repo.findOne(id, { relations });
    if (activity === undefined) {
      throw new ApiError(HTTPStatus.NotFound, `An activity with ID ${id} cannot be found`);
    }
    return activity;
  }

  /**
   * Get the current status-enum belong to the given entity
   */
  async getCurrentStatus(entity: object): Promise<any> {
    // @ts-ignore
    let activities = await this.repo.find({
      where: {
        ...entity,
        type: ActivityType.STATUS,
      },
    });

    activities = activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    // @ts-ignore
    return activities[0].subType;
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
      const status = <ProductInstanceStatus>
        (await new ActivityService(ProductInstanceActivity)
          .getCurrentStatus({ productInstanceId: p.id }));
      // If the statuses include delivered, the contract cannot be cancelled anymore
      if (status === ProductInstanceStatus.DELIVERED) {
        cancelled = false;
        // If the statuses include not delivered or deferred, the contract cannot be finished
      } else if (status === ProductInstanceStatus.NOTDELIVERED
        || status === ProductInstanceStatus.DEFERRED
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
   * Validate the status of the new activity
   * @param act Activity to be created
   * @param statusParam Simple object with an entity ID and a value, used to query the data
   */
  private async validateNewStatus(act: BaseActivity, statusParam: object): Promise<void> {
    if (act.type !== ActivityType.STATUS) return;
    let activity;

    switch (this.EntityActivity) {
      case ContractActivity:
        activity = <ContractActivity>act;
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
          && activity.subType !== ContractStatus.FINISHED
          && activity.subType !== ContractStatus.CANCELLED) {
          throw new ApiError(HTTPStatus.BadRequest, 'Contract is already confirmed by both parties');
        }
        if (statuses.includes(ContractStatus.SENT)
          && activity.subType === ContractStatus.PROPOSED) {
          throw new ApiError(HTTPStatus.BadRequest, 'Contract is already sent');
        }

        break;
      case InvoiceActivity:
        activity = <InvoiceActivity>act;
        if (activity.subType === InvoiceStatus.SENT) {
          await sendInvoiceEmails(activity.invoiceId);
        }

        break;
      case ProductInstanceActivity:
        activity = <ProductInstanceActivity>act;

        // If we want to set the status to delivered or cancelled, we need to do some validation
        if (activity.subType === ProductInstanceStatus.DELIVERED
          || activity.subType === ProductInstanceStatus.CANCELLED
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
        return;
    }

    // If the activity is a status, verify that it's unique for this entity
    if ((await this.getStatuses(statusParam)).includes(activity.subType)) {
      throw new ApiError(HTTPStatus.BadRequest, `Given entity already has or had status ${activity.subType}`);
    }
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
        break;
      case InvoiceActivity:
        activity.invoiceId = params.entityId;
        statusParam = { invoiceId: params.entityId };
        break;
      case ProductInstanceActivity:
        activity.productInstanceId = params.entityId;
        statusParam = { productInstanceId: params.entityId };
        break;
      default:
        throw new TypeError(`Type ${this.EntityActivity.constructor.name} is not a valid entity activity`);
    }

    await this.validateNewStatus(activity, statusParam);

    // Save the activity to the database
    activity = await this.repo.save(activity);

    let ac;
    switch (this.EntityActivity) {
      case CompanyActivity:
        ac = (await this.getActivity(activity.id, ['company'])) as CompanyActivity;
        await ac.company.setUpdatedAtToNow();
        break;
      case ProductActivity:
        ac = (await this.getActivity(activity.id, ['product'])) as ProductActivity;
        await ac.product.setUpdatedAtToNow();
        break;
      case ContractActivity:
        ac = (await this.getActivity(activity.id, ['contract'])) as ContractActivity;
        await ac.contract.setUpdatedAtToNow();
        break;
      case InvoiceActivity:
        ac = (await this.getActivity(activity.id, ['invoice'])) as InvoiceActivity;
        await ac.invoice.setUpdatedAtToNow();
        break;
      case ProductInstanceActivity:
        ac = (await this.getActivity(activity.id, ['productInstance', 'productInstance.contract'])) as ProductInstanceActivity;
        await ac.productInstance.setUpdatedAtToNow();
        break;
      default:
        throw new TypeError(`Type ${this.EntityActivity.constructor.name} is not a valid entity activity`);
    }

    // If the status of a ProductInstance was changed, check whether we can also update the contract
    if (this.EntityActivity === ProductInstanceActivity && activity.type === ActivityType.STATUS) {
      const prodInst = await new ProductInstanceService().getProduct(activity.productInstanceId);
      await this.endContractIfPossible(prodInst.contractId);
    }

    return activity;
  }

  /**
   * Add a product to the activities of this contract, either
   * by creating a new activity or updating the most recent one.
   * @param productName Name of the product
   * @param contractId ID of the contract
   */
  async createProductActivity(productName: string, contractId: number) {
    if (this.EntityActivity !== ContractActivity) {
      throw new Error('Can only create a ProductActivity for contracts');
    }

    const previousActivity = await this.repo.findOne({
      where: {
        contractId,
        createdById: this.actor?.id,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    // When there exists a previous activity...
    if (previousActivity !== undefined
      // And this activity is a PRODUCT activity...
      && previousActivity.type === ActivityType.ADDPRODUCT
      // And this activity has been updated no more than 5 minutes ago...
      && previousActivity.updatedAt > new Date(Date.now() - 1000 * 60 * 5)
    ) {
      // Update this activity with an updated description
      await this.updateActivity(contractId, previousActivity.id, {
        description: appendProductActivityDescription([productName], previousActivity.description),
      });
    } else {
      // Add a new Product activity
      await this.createActivity({
        description: createAddProductActivityDescription([productName]),
        entityId: contractId,
        type: ActivityType.ADDPRODUCT,
      });
    }
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

    if (activity === undefined) {
      return;
    }
    // @ts-ignore
    if (activity.type === ActivityType.STATUS && (activity.subType === ContractStatus.CREATED
      // @ts-ignore
      || activity.subType === InvoiceStatus.CREATED
      // @ts-ignore
      || activity.subType === ProductInstanceStatus.NOTDELIVERED
    )) {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot delete the initial (created) status of an entity');
    }

    await this.repo.delete(activity!.id);
  }
}
