import {
  Body, Controller, Get, Post, Put, Query, Request, Response, Route, Security, Tags,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import ProductCategoryService, {
  CategoryListResponse,
  CategoryParams,
  CategorySummary,
} from '../services/ProductCategoryService';
import { ListParams } from './ListParams';
import { WrappedApiError } from '../helpers/error';
import { ProductCategory } from '../entity/ProductCategory';
import { validate } from '../helpers/validation';

@Route('category')
@Tags('Product Category')
export class ProductCategoryController extends Controller {
  private async validateCategoryParams(req: express.Request) {
    await validate([
      body('name').notEmpty().trim(),
    ], req);
  }

  /**
   * Get a list of all categories with the provided filters
   * @param col Sorted column
   * @param dir Sorting direction
   * @param skip Number of elements to skip
   * @param take Amount of elements to request
   * @param search String to filter on value of select columns
   */
  @Get()
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllCategories(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<CategoryListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new ProductCategoryService().getAllCategories(lp);
  }

  /**
   * Retrieve a list of all categories as compact as possible.
   * Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getCategorySummaries(): Promise<CategorySummary[]> {
    return new ProductCategoryService().getCategorySummaries();
  }

  /**
   * Create a new category
   * @param params Parameters to create category with
   * @param req Express.js request object
   */
  @Post()
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async createCategory(
    @Body() params: CategoryParams, @Request() req: express.Request,
  ): Promise<ProductCategory> {
    await this.validateCategoryParams(req);
    return new ProductCategoryService().createCategory(params);
  }

  /**
   * Retrieve a single category with all their products
   * @param id ID of the category
   */
  @Get('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getCategory(id: number): Promise<ProductCategory> {
    return new ProductCategoryService().getCategory(id);
  }

  /**
   * Update a category object
   * @param id ID of the category
   * @param params Update subset of parameter of category
   * @param req Express.js request object
   */
  @Put('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateCategory(
    id: number, @Body() params: Partial<CategoryParams>, @Request() req: express.Request,
  ): Promise<ProductCategory> {
    await this.validateCategoryParams(req);
    return new ProductCategoryService().updateCategory(id, params);
  }
}
