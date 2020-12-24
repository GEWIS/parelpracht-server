import {
  Controller, Get, Post, Route,
} from 'tsoa';
import UserService from '../services/UserService';
import { User } from '../entity/User';

@Route('')
export class RootController extends Controller {
  @Get('greet/{name}')
  public async getGreetName(name: string): Promise<string> {
    return `Hello ${name}!`;
  }

  @Post('createdummyuser/{firstName}/{lastName}')
  public async createDummyUser(firstName: string, lastName: string): Promise<User> {
    return new UserService().createUser(firstName, lastName);
  }
}
