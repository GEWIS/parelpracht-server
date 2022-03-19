import { getRepository, Repository } from 'typeorm';
import { Role } from '../entity/Role';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface RoleParams {
  ldapGroup?: string;
}

export default class RoleService {
  repo: Repository<Role>;

  constructor(
    repo?: Repository<Role>,
  ) {
    this.repo = repo ?? getRepository(Role);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.repo.find();
  }

  async getRole(id: string): Promise<Role> {
    const role = await this.repo.findOne(id);
    if (!role) throw new ApiError(HTTPStatus.NotFound, 'Role not found.');
    return role;
  }

  async updateRole(id: string, params: Partial<RoleParams>): Promise<Role> {
    let role = await this.repo.findOne(id);
    if (!role) throw new ApiError(HTTPStatus.NotFound, 'Role not found.');

    await this.repo.update(id, params);
    role = await this.repo.findOne(id);
    return role!;
  }
}
