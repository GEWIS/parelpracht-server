import { body } from 'express-validator';
import { Body, Controller, Delete, Get, Post, Put, Request, Response, Route, Security, Tags } from 'tsoa';
import { User } from '../entity/User';
import { ApiError, HTTPStatus, WrappedApiError } from '../helpers/error';
import UserService, { TransferUserParams, UserListResponse, UserParams, UserSummary } from '../services/UserService';
import { validate } from '../helpers/validation';
import { Gender } from '../entity/enums/Gender';
import { Roles } from '../entity/enums/Roles';
import FileService from '../services/FileService';
import { IdentityLocal } from '../entity/IdentityLocal';
import AuthService, { LdapIdentityParams } from '../services/AuthService';
import { IdentityLDAP } from '../entity/IdentityLDAP';
import GDPRService from '../services/GDPRService';
import { ExpressRequest } from '../types/express';
import { ListParams } from './ListParams';

@Route('user')
@Tags('User')
export class UserController extends Controller {
  private async validateUserParams(req: ExpressRequest) {
    await validate(
      [
        body('email').isEmail().normalizeEmail(),
        body('firstName').notEmpty().trim(),
        body('lastNamePreposition').trim(),
        body('lastName').notEmpty().trim(),
        body('function').notEmpty().trim(),
        body('gender').isIn(Object.values(Gender)),
        body('comment').trim(),
        body('roles').isArray(),
      ],
      req,
    );
  }

  /**
   * getAllUsers() - retrieve multiple users
   * @param lp List parameters to sort and filter the list
   */
  @Post('table')
  @Security('local', ['GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getAllUsers(@Body() lp: ListParams): Promise<UserListResponse> {
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
   * @param req Express.js request object
   */
  @Get('{id}')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async getUser(id: number, @Request() req: ExpressRequest): Promise<User> {
    const actor = req.user as User;
    if (actor.id !== id && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can view and change other users",
      );
    }

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
  public async deleteUser(@Request() req: ExpressRequest, id: number): Promise<void> {
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
  public async createUser(@Body() params: UserParams, @Request() req: ExpressRequest): Promise<User> {
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
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async updateUser(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: Partial<UserParams>,
  ): Promise<User> {
    const actor = req.user as User;
    if (actor.id !== id && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can change other users",
      );
    }

    await this.validateUserParams(req);
    return new UserService().updateUser(id, params, actor);
  }

  /**
   * Upload an avatar for this user. Can only be done for yourself, or by an admin
   * @param req Express.js request object
   * @param id ID of the user
   */
  @Put('{id}/logo')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async uploadUserAvatar(@Request() req: ExpressRequest, id: number) {
    const actor = req.user as User;
    if (actor.id !== id && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can change other users",
      );
    }
    // delete the old avatar
    await this.deleteUserAvatar(req, id);
    // upload the new avatar
    await FileService.uploadUserAvatar(req, id);
  }

  /**
   * Delete the avatar for this user. Can only be done for yourself, or by an admin
   * @param req Express.js request object
   * @param id ID of the user
   */
  @Delete('{id}/logo')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async deleteUserAvatar(@Request() req: ExpressRequest, id: number): Promise<User> {
    const actor = req.user as User;
    if (actor.id !== id && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can change other users",
      );
    }

    return new UserService().deleteUserAvatar(id);
  }

  /**
   * Upload a background for this user. Can only be done for yourself
   * @param req Express.js request object
   * @param id ID of the user
   */
  @Put('{id}/background')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async uploadUserBackground(@Request() req: ExpressRequest, id: number) {
    const actor = req.user as User;
    if (actor.id !== id) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. You can only upload your own background.",
      );
    }
    // delete the old background
    await this.deleteUserBackground(req, id);
    // upload the new background
    await FileService.uploadUserBackground(req, id);
  }

  /**
   * Delete the background for this user. Can only be done for yourself, or by an admin
   * @param req Express.js request object
   * @param id ID of the user
   */
  @Delete('{id}/background')
  @Security('local', ['SIGNEE', 'FINANCIAL', 'GENERAL', 'ADMIN', 'AUDIT'])
  @Response<WrappedApiError>(401)
  public async deleteUserBackground(@Request() req: ExpressRequest, id: number): Promise<User> {
    const actor = req.user as User;
    if (actor.id !== id && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can delete other user backgrounds.",
      );
    }

    return new UserService().deleteUserBackground(id);
  }

  /**
   * Move all user's assignments to another user (contracts and invoices)
   * @param req Express.js request object
   * @param id ID of the from-user
   * @param params parameters, namely ID of the to-user
   */
  @Post('{id}/assignments')
  @Security('local', ['ADMIN', 'GENERAL'])
  @Response<WrappedApiError>(401)
  public async transferAssignments(
    @Request() req: ExpressRequest,
    id: number,
    @Body() params: TransferUserParams,
  ): Promise<void> {
    const actor = req.user as User;
    if (actor.id !== id && !actor.hasRole(Roles.ADMIN)) {
      throw new ApiError(
        HTTPStatus.Unauthorized,
        "You don't have permission to do this. Only admins can change other users",
      );
    }

    await validate([body('toUserId').isInt()], req);

    await new UserService().transferAssignments(id, params.toUserId);
  }

  @Post('{id}/auth/local')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async createLocalIdentity(@Request() _: ExpressRequest, id: number): Promise<IdentityLocal> {
    const user = await new UserService().getUser(id);
    return new AuthService().createIdentityLocal(user, false);
  }

  @Delete('{id}/auth/local')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteLocalIdentity(@Request() _: ExpressRequest, id: number): Promise<void> {
    const user = await new UserService().getUser(id);
    return new AuthService().removeIdentityLocal(user);
  }

  @Post('{id}/auth/ldap')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async createLdapIdentity(
    @Request() _: ExpressRequest,
    id: number,
    @Body() params: LdapIdentityParams,
  ): Promise<IdentityLDAP> {
    const user = await new UserService().getUser(id);
    return new AuthService().createIdentityLdap(user, params);
  }

  @Put('{id}/auth/ldap')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateLdapIdentity(
    @Request() _: ExpressRequest,
    id: number,
    @Body() params: Partial<LdapIdentityParams>,
  ): Promise<IdentityLDAP> {
    const user = await new UserService().getUser(id);
    return new AuthService().updateIdentityLdap(user, params);
  }

  @Delete('{id}/auth/ldap')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async deleteLdapIdentity(@Request() _: ExpressRequest, id: number): Promise<void> {
    const user = await new UserService().getUser(id);
    return new AuthService().removeIdentityLdap(user);
  }

  /**
   * Dump all the given user's personal information for GDPR requests
   */
  @Get('{id}/dump')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async dumpPersonalInformation(id: number) {
    return new GDPRService().getDump(id);
  }
}
