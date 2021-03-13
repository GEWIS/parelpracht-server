import {
  FindConditions, FindManyOptions, getRepository, ILike, In, Repository,
} from 'typeorm';
import { ListParams } from '../controllers/ListParams';
import { Gender } from '../entity/enums/Gender';
import { IdentityLocal } from '../entity/IdentityLocal';
import { Role } from '../entity/Role';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { cartesian, cartesianArrays } from '../helpers/filters';
import AuthService from './AuthService';
import { Roles } from '../entity/enums/Roles';
// eslint-disable-next-line import/no-cycle
import ContractService from './ContractService';
// eslint-disable-next-line import/no-cycle
import InvoiceService from './InvoiceService';
import FileHelper from '../helpers/fileHelper';

export interface UserParams {
  email: string;
  firstName: string;
  lastNamePreposition?: string;
  lastName: string;
  function: string;
  gender: Gender;
  replyToEmail?: string;
  receiveEmails?: boolean;
  sendEmailsToReplyToEmail?: boolean;
  comment?: string;

  roles?: Roles[]
}

export interface TransferUserParams {
  toUserId: number;
}

export interface UserSummary {
  id: number;
  firstName: string;
  lastNamePreposition: string;
  lastName: string;
  email: string;
  avatarFilename: string;
}

export interface UserListResponse {
  list: User[];
  count: number;
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

    let conditions: FindConditions<User>[] = [];

    if (params.filters !== undefined) {
      const filters: FindConditions<User> = {};
      params.filters.forEach((f) => {
        // @ts-ignore
        filters[f.column] = f.values.length !== 1 ? In(f.values) : f.values[0];
      });
      conditions.push(filters);
    }

    if (params.search !== undefined && params.search.trim() !== '') {
      const rawSearches: FindConditions<User>[][] = [];
      params.search.trim().split(' ').forEach((searchTerm) => {
        rawSearches.push([
          { firstName: ILike(`%${searchTerm}%`) },
          { lastNamePreposition: ILike(`%${searchTerm}%`) },
          { lastName: ILike(`%${searchTerm}%`) },
          { email: ILike(`%${searchTerm}%`) },
        ]);
      });
      const searches = cartesianArrays(rawSearches);
      if (conditions.length > 0) {
        conditions = cartesian(conditions, searches);
      } else {
        conditions = searches;
      }
    }

    findOptions.where = conditions;

    return {
      list: await this.repo.find({
        ...findOptions,
        skip: params.skip,
        take: params.take,
      }),
      count: await this.repo.count(findOptions),
    };
  }

  async getTreasurersToSendEmail(): Promise<User[]> {
    return this.repo.find({
      where: {
        receiveEmails: true,
      },
      relations: ['roles'],
    });
  }

  async getUserSummaries(): Promise<UserSummary[]> {
    return this.repo.find({
      select: ['id', 'firstName', 'lastNamePreposition', 'lastName', 'email', 'avatarFilename'],
    });
  }

  async deleteUser(id: number, actor: User): Promise<void> {
    if (id === actor.id) {
      throw new ApiError(HTTPStatus.BadRequest, 'You cannot delete yourself');
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
      lastNamePreposition: params.lastNamePreposition,
      lastName: params.lastName,
      comment: params.comment,
      function: params.function,
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

  async deleteUserAvatar(id: number): Promise<User> {
    const user = await this.getUser(id);
    if (user.avatarFilename === '') return user;

    try {
      FileHelper.removeFileAtLoc(user.avatarFilename);
    } finally {
      await this.repo.update(user.id, { avatarFilename: '' });
    }

    return this.getUser(id);
  }

  async transferAssignments(fromUserId: number, toUserId: number): Promise<void> {
    const fromUser = await this.getUser(fromUserId);
    const toUser = await this.getUser(toUserId);
    if (!toUser.hasRole(Roles.GENERAL)) {
      throw new ApiError(HTTPStatus.BadRequest, 'User does not have the "general" role');
    }

    await Promise.all([
      new ContractService().transferAssignments(fromUser, toUser),
      new InvoiceService().transferAssignments(fromUser, toUser),
    ]);
  }
}
