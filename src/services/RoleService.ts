import { Repository } from 'typeorm';
import { Role } from '../entity/Role';
import { ApiError, HTTPStatus } from '../helpers/error';
import AppDataSource from '../database';

export interface RoleParams {
  ldapGroup?: string;
}

export default class RoleService {
  repo: Repository<Role>;

  constructor(repo?: Repository<Role>) {
    this.repo = repo ?? AppDataSource.getRepository(Role);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.repo.find();
  }

  async getRole(name: string): Promise<Role> {
    const role = await this.repo.findOneBy({ name });
    if (!role) throw new ApiError(HTTPStatus.NotFound, 'Role not found.');
    return role;
  }

  async updateRole(name: string, params: Partial<RoleParams>): Promise<Role> {
    let role = await this.repo.findOneBy({ name });
    if (!role) throw new ApiError(HTTPStatus.NotFound, 'Role not found.');

    await this.repo.update(name, params);
    role = await this.repo.findOneBy({ name });
    return role!;
  }
}
