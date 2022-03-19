import {
  Body,
  Controller, Get, Put, Response, Route, Security, Tags,
} from 'tsoa';
import { WrappedApiError } from '../helpers/error';
import { Role } from '../entity/Role';
import RoleService, { RoleParams } from '../services/RoleService';

@Route('role')
@Tags('Role')
export class RoleController extends Controller {
  @Get('')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async getAllRoles(): Promise<Role[]> {
    return new RoleService().getAllRoles();
  }

  @Get('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async getRole(id: string): Promise<Role> {
    return new RoleService().getRole(id);
  }

  @Put('{id}')
  @Security('local', ['ADMIN'])
  @Response<WrappedApiError>(401)
  public async updateRole(
    id: string, @Body() params: Partial<RoleParams>,
  ): Promise<Role> {
    return new RoleService().updateRole(id, params);
  }
}
