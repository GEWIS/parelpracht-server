import express from 'express';
import { body } from 'express-validator';
import ProductCategoryService, {
  CategoryListResponse,
  CategoryParams,
  CategorySummary,
} from '../services/ProductCategoryService';
import { WrappedApiError } from '../helpers/error';
import { ProductCategory } from '../entity/ProductCategory';
import { validate } from '../helpers/validation';
import StatisticsService, { ContractedProductsAnalysis } from '../services/StatisticsService';
import { ListParams } from './ListParams';
import { Body, Controller, Delete, Get, Post, Put, Request, Response, Route, Security, Tags } from 'tsoa';

@Route('category')
@Tags('Product Category')
export class ProductCategoryController extends Controller {
  private async validateCategoryParams(req: express.Request) {
    await validate([body('name').notEmpty().trim()], req);
  }

  /**
   * Get a list of all categories with the provided filters
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getAllCategories(@Body() lp: ListParams): Promise<CategoryListResponse> {
    return new ProductCategoryService().getAllCategories(lp);
  }

  /**
   * Retrieve a list of all categories as compact as possible.
   * Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT', 'SIGNEE', 'FINANCIAL'])
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
    @Body() params: CategoryParams,
    @Request() req: express.Request,
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
    id: number,
    @Body() params: Partial<CategoryParams>,
    @Request() req: express.Request,
  ): Promise<ProductCategory> {
    await this.validateCategoryParams(req);
    return new ProductCategoryService().updateCategory(id, params);
  }

  /**
   * Delete a category object
   * @param id ID of the category
   * @param req Express.js request object
   */
  @Delete('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteCategory(id: number): Promise<void> {
    return new ProductCategoryService().deleteCategory(id);
  }

  /**
   * Get all the numbers needed to draw the bar chart on the dashboard
   * @param year Financial year of the overview
   */
  @Get('stats/contracted/{year}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getContractedProductsStatistics(year: number): Promise<ContractedProductsAnalysis> {
    return new StatisticsService().getProductContractedPerMonth(year);
  }
}
