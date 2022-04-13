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
import { Language } from '../entity/enums/Language';
import { includes } from 'lodash';

export interface ActivityParams {
  description: string;
}

export interface FullActivityParams {
  entityId: number;
  type: ActivityType;
  subType?: any;
  descriptionEnglish: string;
  descriptionDutch: string;
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

export default class ActivityService<T extends BaseActivity> {
  repo: Repository<BaseActivity>;

  /** Child class of BaseActivity */
  EntityActivity: T;

  /** Represents the logged in user, performing an operation */
  actor?: User;

  constructor(EntityActivity: T, options?: { actor?: User }) {
    this.EntityActivity = EntityActivity;
    this.repo = getRepository(EntityActivity.constructor.name);
    this.actor = options?.actor;
  }

  /**
   * Validate the activity object: does it belong to the requested entity and is it not null
   * @param activity Activity object
   * @param entityId ID of an entity (e.g. contract, invoice, company, etc)
   */
  validateActivity(activity: T, entityId: number): any {
    if (activity === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Activity not found');
    }

    if (activity?.getRelatedEntityId() !== entityId) throw new ApiError(HTTPStatus.BadRequest, 'Activity does not belong to the related entity');

    return activity!;
  }

  async getActivity(id: number, relations: string[] = []): Promise<T> {
    const activity = await this.repo.findOne({ where: { id }, relations });
    if (activity == null) {
      throw new ApiError(HTTPStatus.NotFound, `An activity with ID ${id} cannot be found`);
    }
    return activity as T;
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
      select: ['subType'] as any,
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
        (await new ActivityService(new ProductInstanceActivity)
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
      await new ActivityService(new ContractActivity, { actor: this.actor }).createActivity(ContractActivity, {
        entityId: contractId,
        descriptionDutch: '',
        descriptionEnglish: '',
        type: ActivityType.STATUS,
        subType: ContractStatus.CANCELLED,
      } as FullActivityParams);
      return true;
    }
    if (canEndContract.finished) {
      await new ActivityService(new ContractActivity, { actor: this.actor }).createActivity(ContractActivity, {
        entityId: contractId,
        descriptionDutch: '',
        descriptionEnglish: '',
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
    let statuses;

    switch (act.constructor.name) {
    case 'ContractActivity':
      activity = <ContractActivity>act;
      // eslint-disable-next-line no-case-declarations
      const contract = await new ContractService().getContract(activity.contractId);
      // eslint-disable-next-line no-case-declarations
      const canEndContract = await this.canEndContract(contract);
      // eslint-disable-next-line no-case-declarations
      statuses = await this.getStatuses({ contractId: activity.contractId });

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
    case 'InvoiceActivity':
      activity = <InvoiceActivity>act;
      if (activity.subType === InvoiceStatus.SENT) {
        sendInvoiceEmails(activity.invoiceId);
      }

      statuses = await this.getStatuses({ invoiceId: activity.invoiceId });
      if (statuses.includes(InvoiceStatus.CANCELLED)
          || statuses.includes(InvoiceStatus.PAID)
          || statuses.includes(InvoiceStatus.IRRECOVERABLE)) {
        throw new ApiError(HTTPStatus.BadRequest, 'Cannot change the status of this invoice, because it is already paid, cancelled or irrecoverable.');
      }
      if (activity.subType === InvoiceStatus.PROPOSED
          && statuses.includes(InvoiceStatus.SENT)) {
        throw new ApiError(HTTPStatus.BadRequest, 'Cannot change the status of this invoice to "Proposed", because it is already sent.');
      }

      break;
    case 'ProductInstanceActivity':
      activity = <ProductInstanceActivity>act;

      break;
    default:
      return;
    }

    // If the activity is a status, verify that it's unique for this entity
    if ((await this.getStatuses(statusParam)).includes(activity.subType)) {
      throw new ApiError(HTTPStatus.BadRequest, `Given entity already has or had status ${activity.subType}`);
    }
  }

  // private activityFactory(newable: new() => T): T {
  //   return new newable();
  // }
  // async activityFactory(C: { new(): T }): T {
  //   return new C();
  // }

  /**
   * Create an activity object with a lot of validation
   * @param C
   * @param params Parameters to create an activity with
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createActivity(C: { new(): T }, params: FullActivityParams): Promise<T> {
    // @ts-ignore
    let activity = new C();
    activity.setRelatedEntityId(params.entityId);
    activity.descriptionDutch = params.descriptionDutch;
    activity.descriptionEnglish = params.descriptionEnglish;
    activity.type = params.type;
    activity.createdBy = this.actor!;
    activity.setSubType(params.subType);

    let statusParam = {};

    switch (activity.constructor.name) {
    case 'ContractActivity':
      statusParam = { contractId: params.entityId };
      break;
    case 'InvoiceActivity':
      statusParam = { invoiceId: params.entityId };
      break;
    case 'ProductInstanceActivity':
      statusParam = { productInstanceId: params.entityId };
      break;
    default:
      break;
    }

    await this.validateNewStatus(activity, statusParam);

    // Save the activity to the database
    activity = await this.repo.save(activity);

    let ac;
    switch (activity.constructor.name) {
    case 'CompanyActivity':
      ac = (await this.getActivity(activity.id, ['company']));
      break;
    case 'ProductActivity':
      ac = (await this.getActivity(activity.id, ['product']));
      break;
    case 'ContractActivity':
      ac = (await this.getActivity(activity.id, ['contract']));
      break;
    case 'InvoiceActivity':
      ac = (await this.getActivity(activity.id, ['invoice']));
      break;
    case 'ProductInstanceActivity':
      ac = (await this.getActivity(activity.id, ['productInstance', 'productInstance.contract']));
      break;
    default:
      throw new TypeError(`Type ${activity.constructor.name} is not a valid entity activity`);
    }

    await ac.getRelatedEntity().setUpdatedAtToNow();

    // If the status of a ProductInstance was changed, check whether we can also update the contract
    if (activity.constructor.name === 'ProductInstanceActivity' && activity.type === ActivityType.STATUS) {
      const prodInst = await new ProductInstanceService().getProduct(activity.getRelatedEntityId());
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
    if (this.repo.target !== 'ContractActivity') {
      throw new Error('Can only create a ProductActivity for contracts');
    }

    const previousActivity = await this.repo.findOne({
      where: {
        contractId,
        createdById: this.actor?.id,
      } as any,
      order: {
        updatedAt: 'DESC',
      },
    });

    // When there exists a previous activity...
    if (previousActivity != null
      // And this activity is a PRODUCT activity...
      && previousActivity.type === ActivityType.ADDPRODUCT
      // And this activity has been updated no more than 5 minutes ago...
      && previousActivity.updatedAt > new Date(Date.now() - 1000 * 60 * 5)
    ) {
      // Update this activity with an updated description
      await this.updateActivity(contractId, previousActivity.id, {
        descriptionDutch: appendProductActivityDescription(
          [productName], previousActivity.descriptionDutch, Language.DUTCH,
        ),
        descriptionEnglish: appendProductActivityDescription(
          [productName], previousActivity.descriptionEnglish, Language.ENGLISH,
        ),
      });
    } else {
      // Add a new Product activity
      // @ts-ignore
      await this.createActivity(ContractActivity, {
        descriptionDutch: createAddProductActivityDescription([productName], Language.DUTCH),
        descriptionEnglish: createAddProductActivityDescription([productName], Language.ENGLISH),
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
    entityId: number, activityId: number, params: Partial<FullActivityParams>,
  ): Promise<T> {
    let activity = await this.repo.findOneBy({ id: activityId }) as T;
    if (activity == null) throw new ApiError(HTTPStatus.NotFound);
    activity = this.validateActivity(activity, entityId);
    let p = {
      descriptionDutch: params.descriptionDutch,
      descriptionEnglish: params.descriptionEnglish,
    };

    await this.repo.update(activity!.id, p);
    activity = await this.repo.findOneBy({ id: activityId }) as T;
    return activity! as T;
  }

  /**
   * Delete an activity object
   * @param entityId ID of the related entity
   * @param activityId ID of the activity
   */
  async deleteActivity(entityId: number, activityId: number): Promise<void> {
    if (this.repo.target === 'InvoiceActivity') {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot delete activities from invoices');
    }

    let activity = await this.repo.findOneBy({ id: activityId }) as T;
    if (activity == null) throw new ApiError(HTTPStatus.NotFound);
    activity = this.validateActivity(activity, entityId);

    if (activity === undefined) {
      return;
    }
    // @ts-ignore
    if (activity.type === ActivityType.STATUS && (activity.subType === ContractStatus.CREATED
      // @ts-ignore
      || activity.subType === InvoiceStatus.CREATED
      // @ts-ignore
      || activity.subType === InvoiceStatus.PROPOSED
      // @ts-ignore
      || activity.subType === ProductInstanceStatus.NOTDELIVERED
    )) {
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot delete the initial (created) status of an entity');
    }

    await this.repo.delete(activity!.id);
  }
}
