import {
  FindManyOptions, getRepository, ILike, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { IdentityLocal } from '../entity/IdentityLocal';
import { Role } from '../entity/Role';
import { Gender, User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import AuthService from './AuthService';

export interface UserParams {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  function: string;
  gender: Gender;
  comment: string;

  roles?: Roles[]
}

export interface UserSummary {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
}

export interface UserListResponse {
  list: User[];
  count: number;
}

export enum Roles {
  SIGNEE = 'SIGNEE',
  FINANCIAL = 'FINANCIAL',
  ADMIN = 'ADMIN',
  GENERAL = 'GENERAL',
  AUDIT = 'AUDIT',
}

export default class UserService {
  repo: Repository<User>;

  roleRepo: Repository<Role>;

  identityRepo: Repository<IdentityLocal>;

  constructor(
    userRepo?: Repository<User>,
    roleRepo?: Repository<Role>,
    identityRepo?: Repository<IdentityLocal>,
  ) {
    this.repo = userRepo ?? getRepository(User);
    this.roleRepo = roleRepo ?? getRepository(Role);
    this.identityRepo = identityRepo ?? getRepository(IdentityLocal);
  }

  async getUser(id: number): Promise<User> {
    const user = await this.repo.findOne(id, { relations: ['roles'] });
    if (user === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'User not found');
    }
    return user;
  }

  async getAllUsers(params: ListParams): Promise<UserListResponse> {
    const findOptions: FindManyOptions<User> = {
      order: {
        [params.sorting?.column ?? 'id']:
        params.sorting?.direction ?? 'ASC',
      },
      relations: ['roles'],
    };

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { firstName: ILike(`%${params.search.trim()}%`) },
        { middleName: ILike(`%${params.search.trim()}%`) },
        { lastName: ILike(`%${params.search.trim()}%`) },
        { email: ILike(`%${params.search.trim()}%`) },
        /* To add: ID */
      ];
    }

    return {
      list: await this.repo.find({
        ...findOptions,
        skip: params.skip,
        take: params.take,
      }),
      count: await this.repo.count(findOptions),
    };
  }

  async getUserSummaries(): Promise<UserSummary[]> {
    return this.repo.find({
      select: ['id', 'firstName', 'middleName', 'lastName', 'email'],
    });
  }

  async deleteUser(id: number, actor: User): Promise<void> {
    if (id === actor.id) {
      throw new ApiError(HTTPStatus.Forbidden, 'You cannot delete yourself');
    }
    const user = await this.repo.findOne(id, { relations: ['roles'] });
    if (user === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'User not found');
    }
    await this.repo.softDelete(user.id);
    await new AuthService().deleteIdentities(user.id);
  }

  async createUser(params: UserParams): Promise<User> {
    const { roles, ...userParams } = params;
    let user = this.repo.create(userParams);
    user = await this.repo.save(user);
    if (roles) {
      user = await this.assignRoles(user, roles);
    }
    await new AuthService().createIdentityLocal(user);
    return user;
  }

  async createAdminUser(params: UserParams): Promise<User> {
    const adminUser = await this.repo.save({
      email: params.email,
      gender: params.gender,
      firstName: params.firstName,
      middleName: params.middleName,
      lastName: params.lastName,
      comment: params.comment,
    });

    return this.assignRoles(adminUser,
      [Roles.ADMIN, Roles.FINANCIAL, Roles.SIGNEE, Roles.GENERAL, Roles.AUDIT]);
  }

  async assignRoles(user: User, roles: Roles[]): Promise<User> {
    const newUser = user;

    newUser.roles = roles.map((r) => ({ name: r } as Role));
    await this.repo.save(newUser);
    this.repo.findOne(newUser.id, { relations: ['roles'] });
    return newUser;
  }

  async updateUser(id: number, params: Partial<UserParams>, actor: User): Promise<User> {
    const { roles, ...userParams } = params;
    await this.repo.update(id, userParams);
    let user = (await this.repo.findOne(id))!;
    // Check if roles should be assigned. You can't update your own roles
    if (roles && id !== actor.id) {
      user = await this.assignRoles(user, roles);
    }
    return user!;
  }

  async setupRoles() {
    await this.roleRepo.save(
      this.roleRepo.create([
        { name: Roles.FINANCIAL },
        { name: Roles.SIGNEE },
        { name: Roles.GENERAL },
        { name: Roles.ADMIN },
        { name: Roles.AUDIT },
      ]),
    );
  }
}
