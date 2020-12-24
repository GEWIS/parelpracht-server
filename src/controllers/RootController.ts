import {
  Controller, Body, Post, Route,
} from 'tsoa';
import ServerSettingsService, { SetupParams } from '../services/ServerSettingsService';
import UserService from '../services/UserService';
import { User } from '../entity/User';

@Route('')
export class RootController extends Controller {
  @Post('setup')
  public async postSetup(@Body() params: SetupParams): Promise<void> {
    return new ServerSettingsService().initialSetup(params);
  }

  @Post('createdummyuser/{firstName}/{lastName}')
  public async createDummyUser(firstName: string, lastName: string): Promise<User> {
    return new UserService().createUser(firstName, lastName);
  }
}
