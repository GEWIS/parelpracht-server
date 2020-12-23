import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Request, Response, Security,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import { Product } from '../entity/Product';
import ProductService, { ProductListResponse, ProductParams } from '../services/ProductService';
import { ListParams } from './ListParams';
import { validate } from '../helpers/validation';
import { WrappedApiError } from '../helpers/error';

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
}
