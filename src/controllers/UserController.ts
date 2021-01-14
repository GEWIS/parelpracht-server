import {
  Body,
  Controller, Post, Route, Put, Tags, Get, Security, Response, Delete, Request,
} from 'tsoa';
import express from 'express';
import { body } from 'express-validator';
import { Gender, User } from '../entity/User';
import { WrappedApiError } from '../helpers/error';
import UserService, { UserListResponse, UserParams, UserSummary } from '../services/UserService';
import { ListParams } from './ListParams';
import { validate } from '../helpers/validation';

@Route('user')
@Tags('User')
export class UserController extends Controller {
  private async validateUserParams(req: express.Request) {
    await validate([
      body('email').isEmail().normalizeEmail(),
      body('firstName').notEmpty().trim(),
      body('lastNamePreposition').trim(),
      body('lastName').notEmpty().trim(),
      body('function').notEmpty().trim(),
      body('gender').isIn(Object.values(Gender)),
      body('comment').trim(),
      body('roles').isArray(),
    ], req);
  }

  /**
   * getAllUsers() - retrieve multiple users
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllUsers(
    @Body() lp: ListParams,
  ): Promise<UserListResponse> {
    return new UserService().getAllUsers(lp);
  }

  /**
   * getUserSummaries() - retrieve a list of all users
   * as compact as possible. Used for display of references and options
   */
  @Get('compact')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getUserSummaries(): Promise<UserSummary[]> {
    return new UserService().getUserSummaries();
  }

  /**
   * getUser() - retrieve single user
   * @param id ID of user to retrieve
   */
  @Get('{id}')
  @Security('local', ['ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getUser(id: number): Promise<User> {
    return new UserService().getUser(id);
  }

  /**
   * deleteUser() - delete single user. You cannot delete yourself.
   * @param req Express.js request object
   * @param id ID of user to delete
   */
  @Delete('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  @Response<WrappedApiError>(403)
  public async deleteUser(@Request() req: Express.Request, id: number): Promise<void> {
    return new UserService().deleteUser(id, req.user as User);
  }

  /**
   * createUser() - create user
   * @param params Parameters to create user with
   * @param req Express.js request object
   */
  @Post()
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async createUser(
    @Body() params: UserParams, @Request() req: express.Request,
  ): Promise<User> {
    await this.validateUserParams(req);
    return new UserService().createUser(params);
  }

  /**
   * updateUser() - update user. You cannot update your own roles.
   * @param req Express.js request object
   * @param id ID of user to update
   * @param params Update subset of parameter of user
   */
  @Put('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateUser(
    @Request() req: express.Request, id: number, @Body() params: Partial<UserParams>,
  ): Promise<User> {
    await this.validateUserParams(req);
    return new UserService().updateUser(id, params, req.user as User);
  }
}
