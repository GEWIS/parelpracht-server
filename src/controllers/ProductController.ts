import {
  Body,
  Controller, Post, Route, Put, Tags,
} from 'tsoa';
import { Product } from '../entity/Product';
import ProductService, { ProductParams } from '../services/ProductService';

@Route('product')
@Tags('Product')
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
