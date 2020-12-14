import {
  Body,
  Controller, Post, Route, Put,
} from 'tsoa';
import { Product } from '../entity/Product';
import ProductService, { ProductParams } from '../services/ProductService';

@Route('product')
export class ProductController extends Controller {
  @Post()
  public async createProduct(@Body() params: ProductParams): Promise<Product> {
    return new ProductService().create(params);
  }

  @Put('{id}')
  public async updateProduct(id: number, @Body() params: Partial<ProductParams>): Promise<Product> {
    return new ProductService().update(id, params);
  }
}
