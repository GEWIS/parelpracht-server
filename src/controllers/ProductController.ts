import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Request, Response, Security, Delete,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import { Product } from '../entity/Product';
import ProductService, { ProductListResponse, ProductParams } from '../services/ProductService';
import { ListParams } from './ListParams';
import { validate } from '../helpers/validation';
import { WrappedApiError } from '../helpers/error';
import ActivityService, {
  CommentParams,
  FullActivityParams,
  StatusParams,
  UpdateActivityParams,
} from '../services/ActivityService';
import BaseActivity, { ActivityType } from '../entity/activity/BaseActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';

@Route('product')
@Tags('Product')
export class ProductController extends Controller {
  /**
   * getAllProducts() - retrieve multiple products
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  @Security('local')
  @Response<WrappedApiError>(401)
  public async getAllProducts(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<ProductListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new ProductService().getAllProducts(lp);
  }

  /**
   * getProduct() - retrieve single product
   * @param id ID of product to retrieve
   */
  @Get('{id}')
  @Security('local')
  @Response<WrappedApiError>(401)
  public async getProduct(id: number): Promise<Product> {
    return new ProductService().getProduct(id);
  }

  /**
   * createProduct() - create product
   * @param params Parameters to create product with
   */
  @Post()
  @Security('local')
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
   * @param id ID of product to update
   * @param params Update subset of parameter of product
   */
  @Put('{id}')
  @Security('local')
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
   * Add a activity status to this product
   * @param id ID of the product
   * @param params Parameters to create this status with
   */
  @Post('{id}/status')
  public async addStatus(id: number, @Body() params: StatusParams): Promise<BaseActivity> {
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.STATUS,
    } as FullActivityParams;
    return new ActivityService(ProductActivity).createActivity(p);
  }

  /**
   * Add a activity comment to this product
   * @param id ID of the product
   * @param params Parameters to create this comment with
   */
  @Post('{id}/comment')
  public async addComment(id: number, @Body() params: CommentParams): Promise<BaseActivity> {
    const p = {
      ...params,
      entityId: id,
      type: ActivityType.COMMENT,
    } as FullActivityParams;
    return new ActivityService(ProductActivity).createActivity(p);
  }

  /**
   * Edit the description of an activity
   * @param id ID of the product
   * @param activityId ID of the activity
   * @param params Update subset of parameter of comment activity
   */
  @Put('{id}/activity/{activityId}')
  public async updateActivity(
    id: number, activityId: number, @Body() params: Partial<UpdateActivityParams>,
  ): Promise<BaseActivity> {
    return new ActivityService(ProductActivity).updateActivity(id, activityId, params);
  }

  /**
   * Delete an activity
   * @param id ID of the product
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  public async deleteActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(ProductActivity).deleteActivity(id, activityId);
  }
}
