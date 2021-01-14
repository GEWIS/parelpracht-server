import {
  Body, Controller, Post, Route, Put, Tags, Get, Delete, Security, Response, Request,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import { Contract } from '../entity/Contract';
import ContractService, {
  ContractListResponse, ContractParams, ContractSummary,
} from '../services/ContractService';
import { ListParams } from './ListParams';
import ProductInstanceService, { ProductInstanceParams } from '../services/ProductInstanceService';
import { ProductInstance, ProductInstanceStatus } from '../entity/ProductInstance';
import { WrappedApiError } from '../helpers/error';
import ActivityService, {
  ActivityParams, FullActivityParams, ContractStatusParams, ProductInstanceStatusParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { ContractActivity, ContractStatus } from '../entity/activity/ContractActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import { User } from '../entity/User';
import FileService, {
  FileParams, FullGenerateContractParams, GenerateContractParams,
} from '../services/FileService';
import { ContractFile } from '../entity/file/ContractFile';
import BaseFile from '../entity/file/BaseFile';
import FileHelper from '../helpers/fileHelper';
import {
  validate, validateActivityParams, validateFileParams,
} from '../helpers/validation';
import ContactService from '../services/ContactService';
import { ContractType, Language, ReturnFileType } from '../pdfgenerator/GenSettings';

@Route('contract')
@Tags('Contract')
export class ContractController extends Controller {
  private async validateContractParams(req: express.Request) {
    await validate([
      body('title').notEmpty().trim(),
      body('companyId').isInt(),
      body('contactId').custom((contactId) => {
        return new ContactService().getContact(contactId).then((contact) => {
          if (contact.companyId !== req.body.companyId) {
            return Promise.reject(new Error('Contact does not belong to company'));
          }
          return Promise.resolve();
        });
      }),
      body('comments').optional().isString().trim(),
      body('assignedToId').optional().isInt(),
    ], req);
  }

  private async validateProductInstanceParams(req: express.Request) {
    await validate([
      body('productId').isInt(),
      body('basePrice').isInt(),
      body('discount').optional().isInt(),
      body('comments').trim(),
    ], req);
  }

  /**
   * getAllContracts() - retrieve multiple contracts
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllContracts(
    @Body() lp: ListParams,
  ): Promise<ContractListResponse> {
    return new ContractService().getAllContracts(lp);
  }

  /**
   * getContractSummaries() - retrieve a list of all contracts
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getContractSummaries(): Promise<ContractSummary[]> {
    return new ContractService().getContractSummaries();
  }

  /**
   * getContract() - retrieve single contract
   * @param id ID of contract to retrieve
   */
  @Get('{id}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getContract(id: number): Promise<Contract> {
    return new ContractService().getContract(id);
  }

  /**
   * createContract() - create contract
   * @param req Express.js request object
   * @param params Parameters to create contract with
   */
  @Post()
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async createContract(
    @Request() req: express.Request,
      @Body() params: ContractParams,
  ): Promise<Contract> {
    await this.validateContractParams(req);
    return new ContractService({ actor: req.user as User }).createContract(params);
  }

  /**
   * updateContract() - update contract
   * @param id ID of contract to update
   * @param params Update subset of parameter of contract
   * @param req Express.js request object
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateContract(
    id: number, @Body() params: Partial<ContractParams>, @Request() req: express.Request,
  ): Promise<Contract> {
    await this.validateContractParams(req);
    return new ContractService().updateContract(id, params);
  }

  /**
   * Delete a contract, if it has no products or updated statuses
   * @param id ID of the contract
   * @param req Express.js request object
   */
  @Delete('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteContract(
    id: number, @Request() req: express.Request,
  ): Promise<void> {
    return new ContractService().deleteContract(id);
  }

  /**
   * Add product to contract
   * @param id - ID of the contract
   * @param params - Create subset of product
   * @param req Express.js request object
   */
  @Post('{id}/product')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addProduct(
    id: number, @Body() params: ProductInstanceParams, @Request() req: express.Request,
  ): Promise<ProductInstance> {
    await this.validateProductInstanceParams(req);
    return new ProductInstanceService({ actor: req.user as User }).addProduct(id, params);
  }

  /**
   * Update a product instance in a contract
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param params Update subset of product instance
   * @param req Express.js request object
   */
  @Put('{id}/product/{prodId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateProduct(
    id: number, prodId: number, @Body() params: Partial<ProductInstanceParams>,
    @Request() req: express.Request,
  ): Promise<ProductInstance> {
    await this.validateProductInstanceParams(req);
    return new ProductInstanceService().updateProduct(id, prodId, params);
  }

  /**
   * Remove product from contract
   * @param id ID of the contract
   * @param prodId ID of the product instance
   */
  @Delete('{id}/product/{prodId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteProduct(id: number, prodId: number): Promise<void> {
    return new ProductInstanceService().deleteProduct(id, prodId);
  }

  /**
   * Add a activity status to a product instance
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param params Parameters to create this status with
   * @param req Express.js request object
   */
  @Post('{id}/product/{prodId}/status')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addProductStatus(
    id: number, prodId: number, @Body() params: ProductInstanceStatusParams,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req, [
      body('subType').isIn(Object.values(ProductInstanceStatus)),
    ]);
    await new ProductInstanceService().validateProductInstanceContractB(id, prodId);
    const p = {
      ...params,
      entityId: prodId,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(ProductInstanceActivity, { actor: req.user as User })
      .createActivity(p);
  }

  /**
   * Add a activity comment to this product instance
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param params Parameters to create this comment with
   * @param req Express.js request object
   */
  @Post('{id}/product/{prodId}/comment')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addProductComment(
    id: number, prodId: number, @Body() params: ActivityParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    await new ProductInstanceService().validateProductInstanceContractB(id, prodId);
    const p = {
      ...params,
      entityId: prodId,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(ProductActivity, { actor: req.user as User }).createActivity(p);
  }

  /**
   * Edit the description of an activity
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   * @param req Express.js request object
   */
  @Put('{id}/product/{prodId}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateProductActivity(
    id: number, prodId: number, activityId: number, @Body() params: Partial<ActivityParams>,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    await new ProductInstanceService().validateProductInstanceContractB(id, prodId);
    return new ActivityService(ProductActivity).updateActivity(prodId, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param activityId ID of the activity
   */
  @Delete('{id}/product/{prodId}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteProductActivity(
    id: number, prodId: number, activityId: number,
  ): Promise<void> {
    await new ProductInstanceService().validateProductInstanceContractB(id, prodId);
    return new ActivityService(ProductActivity).deleteActivity(prodId, activityId);
  }

  /**
   * Create a new PDF file for this contract
   * @param id ID of the contract
   * @param params Parameters to create this file with
   * @param req Express.js request object
   * @return The generated file as download
   */
  @Post('{id}/file/generate')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async generateFile(
    id: number, @Body() params: GenerateContractParams, @Request() req: express.Request,
  ): Promise<any> {
    await validate([
      body('name').notEmpty(),
      body('language').isIn(Object.values(Language)),
      body('contentType').isIn(Object.values(ContractType)),
      body('fileType').isIn(Object.values(ReturnFileType)),
      body('showDiscountPercentages').isBoolean(),
      body('saveToDisk').isBoolean(),
      body('signee1Id').isInt(),
      body('signee2Id').isInt(),
    ], req);
    const file = await new FileService(ContractFile, { actor: req.user as User })
      .generateContractFile({
        ...params,
        entityId: id,
      } as FullGenerateContractParams);

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Upload a file to a contract
   * @param id Id of the contract
   * @param req Express.js request object
   */
  @Post('{id}/file/upload')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async uploadFile(id: number, @Request() req: express.Request): Promise<ContractFile> {
    await validateFileParams(req);
    return new FileService(ContractFile, { actor: req.user as User }).uploadFile(req, id);
  }

  /**
   * Get a saved file from a contract
   * @param id ID of the contract
   * @param fileId ID of the file
   * @return The requested file as download
   */
  @Get('{id}/file/{fileId}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getFile(id: number, fileId: number): Promise<any> {
    const file = <ContractFile>(await new FileService(ContractFile).getFile(id, fileId));

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the contract
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   * @param req Express.js request object
   */
  @Put('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateFile(
    id: number, fileId: number, @Body() params: Partial<FileParams>,
    @Request() req: express.Request,
  ): Promise<BaseFile> {
    await validateFileParams(req);
    return new FileService(ContractFile).updateFile(id, fileId, params);
  }

  /**
   * Delete a file from the system
   * @param id ID of the contract
   * @param fileId ID of the file
   */
  @Delete('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteFile(id: number, fileId: number): Promise<void> {
    return new FileService(ContractFile).deleteFile(id, fileId, true);
  }

  /**
   * Add a activity status to this contract
   * @param id ID of the contract
   * @param params Parameters to create this status with
   * @param req Express.js request object
   */
  @Post('{id}/status')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addStatus(
    id: number, @Body() params: ContractStatusParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req, [
      body('subType').isIn(Object.values(ContractStatus)),
    ]);
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(ContractActivity, { actor: req.user as User }).createActivity(p);
  }

  /**
   * Add a activity comment to this contract
   * @param id ID of the contract
   * @param params Parameters to create this comment with
   * @param req Express.js request object
   */
  @Post('{id}/comment')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addComment(
    id: number, @Body() params: ActivityParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(ContractActivity, { actor: req.user as User }).createActivity(p);
  }

  /**
   * Edit the description and/or related contract of an activity
   * @param id ID of the contract
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   * @param req Express.js request object
   */
  @Put('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<ActivityParams>,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    return new ActivityService(ContractActivity).updateActivity(id, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the contract
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(ContractActivity).deleteActivity(id, activityId);
  }
}
