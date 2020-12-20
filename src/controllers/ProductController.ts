import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Query,
} from 'tsoa';
import { Product } from '../entity/Product';
import ProductService, { ProductParams } from '../services/ProductService';
import { ListParams } from './ListParams';

@Route('product')
@Tags('Product')
export class ProductController extends Controller {
  @Get()
  public async getProducts(
    @Query() col?: string,
      @Query() dir?: 'ASC' | 'DESC',
  ): Promise<Product[]> {
    const lp: ListParams = {};
    if (col && dir) {
      lp.sorting = { column: col, direction: dir };
    }

    return new ProductService().getAll(lp);
  }

  @Get('{id}')
  public async getProduct(id: number): Promise<Product> {
    return new ProductService().get(id);
  }

  @Post()
  public async createProduct(@Body() params: ProductParams): Promise<Product> {
    return new ProductService().create(params);
  }

  @Put('{id}')
  public async updateProduct(id: number, @Body() params: Partial<ProductParams>): Promise<Product> {
    return new ProductService().update(id, params);
  }
}
