import express from 'express';
import { body } from 'express-validator';
import { Product } from '../entity/Product';
import ProductService, {
  PricingParams,
  ProductListResponse,
  ProductParams,
  ProductSummary,
} from '../services/ProductService';
import { validate, validateActivityParams, validateCommentParams, validateFileParams } from '../helpers/validation';
import { ApiError, HTTPStatus, WrappedApiError } from '../helpers/error';
import ActivityService, { ActivityParams, FullActivityParams } from '../services/ActivityService';
import BaseActivity from '../entity/activity/BaseActivity';
import { ProductActivity } from '../entity/activity/ProductActivity';
import FileService, { FileParams } from '../services/FileService';
import FileHelper from '../helpers/fileHelper';
import BaseFile from '../entity/file/BaseFile';
import { ProductFile } from '../entity/file/ProductFile';
import { User } from '../entity/User';
import { ProductStatus } from '../entity/enums/ProductStatus';
import { ActivityType } from '../entity/enums/ActivityType';
import StatisticsService, { DashboardProductInstanceStats } from '../services/StatisticsService';
import ProductInstanceService, { ProductInstanceListResponse } from '../services/ProductInstanceService';
import { AnalysisResultByYear } from '../helpers/rawQueries';
import { ProductPricing } from '../entity/ProductPricing';
import { Roles } from '../entity/enums/Roles';
import { ListParams, PaginationParams } from './ListParams';
import { Body, Controller, Post, Route, Put, Tags, Get, Request, Response, Security, Delete } from 'tsoa';

@Route('product')
@Tags('Product')
export class ProductController extends Controller {
  private async validateProductParams(req: express.Request) {
    await validate(
      [
        body('nameDutch').notEmpty().trim(),
        body('nameEnglish').notEmpty().trim(),
        body('targetPrice')
          .isInt()
          .custom((value) => value > 0),
        body('status').isIn(Object.values(ProductStatus)),
        body('description').trim(),
        body('vatId').isInt(),
        body('categoryId').isInt(),
        body('contractTextDutch').notEmpty().trim(),
        body('contractTextEnglish').notEmpty().trim(),
        body('deliverySpecificationDutch').trim(),
        body('deliverySpecificationEnglish').trim(),
      ],
      req,
    );
  }

  /**
   * getAllProducts() - retrieve multiple products
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getAllProducts(@Body() lp: ListParams): Promise<ProductListResponse> {
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
  @Security('local', ['GENERAL', 'ADMIN'])
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
  public async createProduct(@Request() req: express.Request, @Body() params: ProductParams): Promise<Product> {
    await this.validateProductParams(req);
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
    id: number,
    @Body() params: Partial<ProductParams>,
  ): Promise<Product> {
    await this.validateProductParams(req);
    return new ProductService({ actor: req.user as User }).updateProduct(id, params);
  }

  /**
   * Delete a product, if it has no contracts and/or invoices
   * @param id ID of the product
   * @param req Express.js request object
   */
  @Delete('{id}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteProduct(id: number): Promise<void> {
    return new ProductService().deleteProduct(id);
  }

  /**
   * Add a pricing attribute to a product
   * @param id ID of the product
   * @param req Express.js request object
   */
  @Post('{id}/pricing')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async addPricing(id: number, @Request() req: express.Request): Promise<ProductPricing> {
    return new ProductService({ actor: req.user as User }).addPricing(id);
  }

  /**
   * Update the pricing attribute of a product
   * @param id ID of the product
   * @param params Description string and JSON table (nested array)
   * @param req Express.js request object
   */
  @Put('{id}/pricing')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async updatePricing(
    id: number,
    @Body() params: Partial<PricingParams>,
    @Request() req: express.Request,
  ): Promise<ProductPricing> {
    return new ProductService({ actor: req.user as User }).updatePricing(id, params);
  }

  /**
   * Remove the pricing attribute of a product
   * @param id ID of the product
   * @param req Express.js request object
   */
  @Delete('{id}/pricing')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async deletePricing(id: number, @Request() req: express.Request): Promise<void> {
    return new ProductService({ actor: req.user as User }).deletePricing(id);
  }

  /**
   * Return a list of product instances with their contracts
   * @param id Product id
   * @param params Skip and take to allow for pagination
   */
  @Post('{id}/contracts')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getProductContracts(id: number, @Body() params: PaginationParams): Promise<ProductInstanceListResponse> {
    return new ProductInstanceService().getProductContracts(id, params.skip, params.take);
  }

  /**
   * Return a list of product instances with their invoices
   * @param id Product id
   * @param params Skip and take to allow for pagination
   */
  @Post('{id}/invoices')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getProductInvoices(id: number, @Body() params: PaginationParams): Promise<ProductInstanceListResponse> {
    return new ProductInstanceService().getProductInvoices(id, params.skip, params.take);
  }

  @Get('{id}/statistics')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async getProductStatistics(id: number): Promise<AnalysisResultByYear[]> {
    return new StatisticsService().getProductsInvoicedByFinancialYear(id);
  }

  /**
   * Upload a file to a product
   * @param id Id of the product
   * @param req Express.js request object
   */
  @Post('{id}/file/upload')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async uploadProductFile(id: number, @Request() req: express.Request): Promise<ProductFile> {
    const actor = req.user as User;
    if (req.body.createdAt !== undefined && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can set createdAt.",
      );
    }

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
  public async getProductFile(id: number, fileId: number): Promise<any> {
    const file = <ProductFile>await new FileService(ProductFile).getFile(id, fileId);

    return FileHelper.putFileInResponse(this, file);
  }

  /**
   * Change the attributes of a file
   * @param id ID of the product
   * @param fileId ID of the file
   * @param params Update subset of the parameters of the file
   * @param req Express.js request object
   */
  @Put('{id}/file/{fileId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateProductFile(
    id: number,
    fileId: number,
    @Body() params: Partial<FileParams>,
    @Request() req: express.Request,
  ): Promise<BaseFile> {
    await validateFileParams(req);
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
  public async deleteProductFile(id: number, fileId: number): Promise<void> {
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
  public async addProductComment(
    id: number,
    @Body() params: ActivityParams,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateCommentParams(req);
    const p: FullActivityParams = {
      descriptionDutch: params.description,
      descriptionEnglish: params.description,
      entityId: id,
      type: ActivityType.COMMENT,
    };
    return new ActivityService<ProductActivity>(new ProductActivity(), { actor: req.user as User }).createActivity(
      ProductActivity,
      p,
    );
  }

  /**
   * Edit the description of an activity
   * @param id ID of the product
   * @param activityId ID of the activity
   * @param params Update subset of parameter of comment activity
   * @param req Express.js request object
   */
  @Put('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateProductActivity(
    id: number,
    activityId: number,
    @Body() params: Partial<ActivityParams>,
    @Request() req: express.Request,
  ): Promise<BaseActivity> {
    await validateActivityParams(req);
    const p: Partial<FullActivityParams> = {
      descriptionDutch: params.description,
      descriptionEnglish: params.description,
    };
    return new ActivityService(new ProductActivity()).updateActivity(id, activityId, p);
  }

  /**
   * Delete an activity
   * @param id ID of the product
   * @param activityId ID of the activity
   */
  @Delete('{id}/activity/{activityId}')
  @Security('local', ['GENERAL', 'ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteProductActivity(id: number, activityId: number): Promise<void> {
    return new ActivityService(new ProductActivity()).deleteActivity(id, activityId);
  }

  /**
   * Get all the numbers needed to draw the bar chart on the dashboard
   * @param year Financial year of the overview
   */
  @Get('stats/statuses/{year}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getDashboardProductInstanceStatistics(year: number): Promise<DashboardProductInstanceStats> {
    return new StatisticsService().getDashboardProductInstanceStatistics(year);
  }
}
