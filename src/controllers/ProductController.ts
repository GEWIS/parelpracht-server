import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query, Request, Response,
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
  @Get()
  public async getProducts(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
      @Query() skip?: number,
      @Query() take?: number,
      @Query() search?: string,
  ): Promise<ProductListResponse> {
    const lp: ListParams = { skip, take, search };
    if (col && dir) { lp.sorting = { column: col, direction: dir }; }
    return new ProductService().getAll(lp);
  }

  @Get('{id}')
  public async getProduct(id: number): Promise<Product> {
    return new ProductService().get(id);
  }

  @Post()
  @Response<WrappedApiError>(400)
  public async createProduct(
    @Request() req: express.Request,
      @Body() params: ProductParams,
  ): Promise<Product> {
    await validate([
      body('nameDutch').notEmpty(),
    ], req);

    return new ProductService().create(params);
  }

  @Put('{id}')
  @Response<WrappedApiError>(400)
  public async updateProduct(
    @Request() req: express.Request,
      id: number, @Body() params: Partial<ProductParams>,
  ): Promise<Product> {
    await validate([
      body('nameDutch').notEmpty(),
    ], req);

    return new ProductService().update(id, params);
  }
}
