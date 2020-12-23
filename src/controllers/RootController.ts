import express from 'express';
import {
  Body,
  Controller, Get, Post, Request, Route, Security,

} from 'tsoa';
import { User } from '../entity/User';
import AuthService, { AuthStatus } from '../services/AuthService';
import ServerSettingsService, { SetupParams } from '../services/ServerSettingsService';

@Route('')
export class RootController extends Controller {
  @Post('setup')
  public async postSetup(@Body() params: SetupParams): Promise<void> {
    return new ServerSettingsService().initialSetup(params);
  }

  @Get('authStatus')
  public async getAuthStatus(@Request() req: express.Request): Promise<AuthStatus> {
    return new AuthService().getAuthStatus(req);
  }

  @Get('profile')
  @Security('local')
  public async getProfile(@Request() req: express.Request): Promise<User> {
    return new AuthService().getProfile(req);
  }

  @Post('logout')
  public async logout(@Request() req: express.Request): Promise<void> {
    return new AuthService().logout(req);
  }
}
