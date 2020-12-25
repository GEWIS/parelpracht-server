import {
  FindManyOptions, getRepository, Like, Repository,
} from 'typeorm';
import { VoidExpression } from 'typescript';
import { ListParams } from '../controllers/ListParams';
import { Gender, User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface UserParams {
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: Gender;
  comment: string;
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

export default class UserService {
  repo: Repository<User>;

  constructor() {
    this.repo = getRepository(User);
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
    };

    if (params.search !== undefined && params.search.trim() !== '') {
      findOptions.where = [
        { firstName: Like(`%${params.search.trim()}%`) },
        { middleName: Like(`%${params.search.trim()}%`) },
        { lastName: Like(`%${params.search.trim()}%`) },
        { email: Like(`%${params.search.trim()}%`) },
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

  async deleteUser(id: number): Promise<void> {
    const user = await this.repo.findOne(id, { relations: ['roles'] });
    if (user === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'User not found');
    }
    await this.repo.delete(user);
  }

  createUser(params: UserParams) {
    const user = this.repo.create({
      ...params,
    });
    return this.repo.save(user);
  }

  async updateUser(id: number, params: Partial<UserParams>): Promise<User> {
    await this.repo.update(id, params);
    const user = await this.repo.findOne(id);
    return user!;
  }
}
