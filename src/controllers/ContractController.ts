import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Delete, Security, Response, Request,
} from 'tsoa';
import express from 'express';
import { Contract } from '../entity/Contract';
import ContractService, {
  ContractListResponse,
  ContractParams,
  ContractSummary,
} from '../services/ContractService';
import { ListParams } from './ListParams';
import ProductInstanceService, { ProductInstanceParams } from '../services/ProductInstanceService';
import { ProductInstance } from '../entity/ProductInstance';
import { WrappedApiError } from '../helpers/error';
import ActivityService, {
  CommentParams,
  FullActivityParams,
  StatusParams,
  UpdateActivityParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { ContractActivity } from '../entity/activity/ContractActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import { ProductInstanceActivity } from '../entity/activity/ProductInstanceActivity';
import FileService, {
  FullGenerateContractParams, GenerateContractParams, UpdateFileParams,
} from '../services/FileService';
import { ContractFile } from '../entity/file/ContractFile';
import BaseFile from '../entity/file/BaseFile';
import FileHelper from '../helpers/fileHelper';

@Route('contract')
@Tags('Contract')
export class ContractController extends Controller {
  /**
   * getAllCompanies() - retrieve multiple contracts
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getAllContracts(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<ContractListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new ContractService().getAllContracts(lp);
  }

  /**
   * getContractSummaries() - retrieve a list of all contracts
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getContractSummaries(): Promise<ContractSummary[]> {
    return new ContractService().getContractSummaries();
  }

  /**
   * getContract() - retrieve single contract
   * @param id ID of contract to retrieve
   */
  @Get('{id}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getContract(id: number): Promise<Contract> {
    return new ContractService().getContract(id);
  }

  /**
   * createContract() - create contract
   * @param params Parameters to create contract with
   */
  @Post()
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async createContract(@Body() params: ContractParams): Promise<Contract> {
    return new ContractService().createContract(params);
  }

  /**
   * updateContract() - update contract
   * @param id ID of contract to update
   * @param params Update subset of parameter of contract
   */
  @Put('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateContract(
    id: number, @Body() params: Partial<ContractParams>,
  ): Promise<Contract> {
    return new ContractService().updateContract(id, params);
  }

  /**
   * Add product to contract
   * @param id - ID of the contract
   * @param params - Create subset of product
   */
  @Post('{id}/product')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addProduct(
    id: number, @Body() params: ProductInstanceParams,
  ): Promise<ProductInstance> {
    return new ProductInstanceService().addProduct(id, params);
  }

  /**
   * Update a product instance in a contract
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param params Update subset of product instance
   */
  @Put('{id}/product/{prodId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateProduct(
    id: number, prodId: number, @Body() params: Partial<ProductInstanceParams>,
  ): Promise<ProductInstance> {
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
   */
  @Post('{id}/product/{prodId}/status')
  public async addProductStatus(
    id: number, prodId: number, @Body() params: StatusParams,
  ): Promise<BaseActivity> {
    await new ProductInstanceService().validateProductInstanceContractB(id, prodId);
    const p = {
      ...params,
      entityId: prodId,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(ProductInstanceActivity).createActivity(p);
  }

  /**
   * Add a activity comment to this product instance
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param params Parameters to create this comment with
   */
  @Post('{id}/product/{prodId}/comment')
  public async addProductComment(
    id: number, prodId: number, @Body() params: CommentParams,
  ): Promise<BaseActivity> {
    await new ProductInstanceService().validateProductInstanceContractB(id, prodId);
    const p = {
      ...params,
      entityId: prodId,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(ProductActivity).createActivity(p);
  }

  /**
   * Edit the description of an activity
   * @param id ID of the contract
   * @param prodId ID of the product instance
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   */
  @Put('{id}/product/{prodId}/activity/{activityId}')
  public async updateProductActivity(
    id: number, prodId: number, activityId: number, @Body() params: Partial<UpdateActivityParams>,
  ): Promise<BaseActivity> {
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
   * @return The generated file as download
   */
  @Post('{id}/file/generate')
  public async generateFile(id: number, @Body() params: GenerateContractParams): Promise<any> {
    const file = await new FileService(ContractFile).generateContractFile({
      ...params,
      entityId: id,
    } as FullGenerateContractParams);

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Upload a file to a contract
   * @param id Id of the contract
   * @param request Express.js request object
   */
  @Post('{id}/file/upload')
  public async uploadFile(id: number, @Request() request: express.Request): Promise<ContractFile> {
    return new FileService(ContractFile).uploadFile(request, id);
  }

  /**
   * Get a saved file from a contract
   * @param id ID of the contract
   * @param fileId ID of the file
   * @return The requested file as download
   */
  @Get('{id}/file/{fileId}')
  public async getFile(id: number, fileId: number): Promise<any> {
    const file = <ContractFile>(await new FileService(ContractFile).getFile(id, fileId));

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the contract
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   */
  @Put('{id}/file/{fileId}')
  public async updateFile(
    id: number, fileId: number, @Body() params: Partial<UpdateFileParams>,
  ): Promise<BaseFile> {
    return new FileService(ContractFile).updateFile(id, fileId, params);
  }

  /**
   * Delete a file from the system
   * @param id ID of the contract
   * @param fileId ID of the file
   */
  @Delete('{id}/file/{fileId}')
  public async deleteFile(id: number, fileId: number): Promise<void> {
    return new FileService(ContractFile).deleteFile(id, fileId, true);
  }

  /**
   * Add a activity status to this contract
   * @param id ID of the contract
   * @param params Parameters to create this status with
   */
  @Post('{id}/status')
  public async addStatus(id: number, @Body() params: StatusParams): Promise<BaseActivity> {
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(ContractActivity).createActivity(p);
  }

  /**
   * Add a activity comment to this contract
   * @param id ID of the contract
   * @param params Parameters to create this comment with
   */
  @Post('{id}/comment')
  public async addComment(id: number, @Body() params: CommentParams): Promise<BaseActivity> {
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(ContractActivity).createActivity(p);
  }

  /**
   * Edit the description and/or related contract of an activity
   * @param id ID of the contract
   * @param activityId ID of the activity
   * @param params Update subset of parameter of the activity
   */
  @Put('{id}/activity/{activityId}')
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<UpdateActivityParams>,
  ): Promise<BaseActivity> {
    return new ActivityService(ContractActivity).updateActivity(id, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the contract
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(ContractActivity).deleteActivity(id, activityId);
  }
}
