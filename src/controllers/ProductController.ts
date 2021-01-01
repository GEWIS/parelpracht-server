import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Request, Response, Security, Delete,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import { Product } from '../entity/Product';
import ProductService, { ProductListResponse, ProductParams, ProductSummary } from '../services/ProductService';
import { ListParams } from './ListParams';
import { validate } from '../helpers/validation';
import { WrappedApiError } from '../helpers/error';
import ActivityService, {
  ActivityParams,
  FullActivityParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import FileService, { FileParams } from '../services/FileService';
import FileHelper from '../helpers/fileHelper';
import BaseFile from '../entity/file/BaseFile';
import { ProductFile } from '../entity/file/ProductFile';
import { User } from '../entity/User';

@Route('product')
@Tags('Product')
export class ProductController extends Controller {
  /**
   * getAllProducts() - retrieve multiple products
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllProducts(
    @Body() lp: ListParams,
  ): Promise<ProductListResponse> {
    return new ProductService().getAllProducts(lp);
  }

  /**
   * getProductSummaries() - retrieve a list of all products
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getProductSummaries(): Promise<ProductSummary[]> {
    return new ProductService().getProductSummaries();
  }

  /**
   * getProduct() - retrieve single product
   * @param id ID of product to retrieve
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getProduct(id: number): Promise<Product> {
    return new ProductService().getProduct(id);
  }

  /**
   * createProduct() - create product
   * @param req Express.js request object
   * @param params Parameters to create product with
   */
  @Post()
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  @Response<WrappedApiError>(400)
  public async createProduct(
    @Request() req: express.Request,
      @Body() params: ProductParams,
  ): Promise<Product> {
    await validate([
      body('nameDutch').notEmpty(),
    ], req);

    return new ProductService().createProduct(params);
  }

  /**
   * updateProduct() - update product
   * @param req Express.js request object
   * @param id ID of product to update
   * @param params Update subset of parameter of product
   */
  @Put('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  @Response<WrappedApiError>(400)
  public async updateProduct(
    @Request() req: express.Request,
      id: number, @Body() params: Partial<ProductParams>,
  ): Promise<Product> {
    await validate([
      body('nameDutch').notEmpty(),
    ], req);

    return new ProductService().updateProduct(id, params);
  }

  /**
   * Upload a file to a product
   * @param id Id of the product
   * @param req Express.js request object
   */
  @Post('{id}/file/upload')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async uploadFile(id: number, @Request() req: express.Request): Promise<ProductFile> {
    return new FileService(ProductFile, { actor: req.user as User }).uploadFile(req, id);
  }

  /**
   * Get a saved file from a product
   * @param id ID of the product
   * @param fileId ID of the file
   * @return The requested file as download
   */
  @Get('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getFile(id: number, fileId: number): Promise<any> {
    const file = <ProductFile>(await new FileService(ProductFile).getFile(id, fileId));

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the product
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   */
  @Put('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateFile(
    id: number, fileId: number, @Body() params: Partial<FileParams>,
  ): Promise<BaseFile> {
    return new FileService(ProductFile).updateFile(id, fileId, params);
  }

  /**
   * Delete a file from the system
   * @param id ID of the product
   * @param fileId ID of the file
   */
  @Delete('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteFile(id: number, fileId: number): Promise<void> {
    return new FileService(ProductFile).deleteFile(id, fileId, true);
  }

  /**
   * Add a activity comment to this product
   * @param id ID of the product
   * @param params Parameters to create this comment with
   * @param req Express.js request object
   */
  @Post('{id}/comment')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async addComment(
    id: number, @Body() params: ActivityParams, @Request() req: express.Request,
  ): Promise<BaseActivity> {
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(ProductActivity, { actor: req.user as User }).createActivity(p);
  }

  /**
   * Edit the description of an activity
   * @param id ID of the product
   * @param activityId ID of the activity
   * @param params Update subset of parameter of comment activity
   */
  @Put('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<ActivityParams>,
  ): Promise<BaseActivity> {
    return new ActivityService(ProductActivity).updateActivity(id, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the product
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(ProductActivity).deleteActivity(id, activityId);
  }
}
