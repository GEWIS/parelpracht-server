import {
  Controller, Get, Route,
} from 'tsoa';

@Route('')
export class RootController extends Controller {
  @Get('greet/{name}')
  public async getGreetName(name: string): Promise<string> {
    return `Hello ${name}!`;
  }
}
