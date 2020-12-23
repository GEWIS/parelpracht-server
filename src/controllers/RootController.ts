import {
  Body,
  Controller, Get, Post, Route,

} from 'tsoa';
import ServerSettingsService, { SetupParams } from '../services/ServerSettingsService';

@Route('')
export class RootController extends Controller {
  @Post('setup')
  public async postSetup(@Body() params: SetupParams): Promise<void> {
    return new ServerSettingsService().initialSetup(params);
  }
}
