import path from 'path';
import { FindManyOptions, Repository } from 'typeorm';
import validator from 'validator';
import { ListParams } from '../controllers/ListParams';
import { Gender } from '../entity/enums/Gender';
import { IdentityLocal } from '../entity/IdentityLocal';
import { Role } from '../entity/Role';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import { addQueryWhereClause } from '../helpers/filters';
import { Roles } from '../entity/enums/Roles';
import FileHelper, { uploadUserAvatarDirLoc, uploadUserBackgroundDirLoc } from '../helpers/fileHelper';
import { IdentityLDAP } from '../entity/IdentityLDAP';
import { ldapEnabled } from '../auth';
import AppDataSource from '../database';
import InvoiceService from './InvoiceService';
import ContractService from './ContractService';
import AuthService from './AuthService';

export interface UserParams {
  email: string;
  firstName: string;
  lastNamePreposition?: string;
  lastName: string;
  function: string;
  gender: Gender;
  password: string;
  rememberMe: boolean;
  replyToEmail?: string;
  receiveEmails?: boolean;
  sendEmailsToReplyToEmail?: boolean;
  comment?: string;

  ldapOverrideEmail?: boolean;

  roles?: Roles[];
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
  backgroundFilename: string;
  roles: Roles[];
}

export interface UserListResponse {
  list: User[];
  count: number;
}

export default class UserService {
  repo: Repository<User>;

  roleRepo: Repository<Role>;

  identityLocalRepo: Repository<IdentityLocal>;

  identityLdapRepo: Repository<IdentityLDAP>;

  constructor(
    userRepo?: Repository<User>,
    roleRepo?: Repository<Role>,
    identityLocalRepo?: Repository<IdentityLocal>,
    identityLdapRepo?: Repository<IdentityLDAP>,
  ) {
    this.repo = userRepo ?? AppDataSource.getRepository(User);
    this.roleRepo = roleRepo ?? AppDataSource.getRepository(Role);
    this.identityLocalRepo = identityLocalRepo ?? AppDataSource.getRepository(IdentityLocal);
    this.identityLdapRepo = identityLdapRepo ?? AppDataSource.getRepository(IdentityLDAP);
  }

  async getUser(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id }, relations: ['roles', 'identityLocal', 'identityLdap'] });
    if (user == null) {
      throw new ApiError(HTTPStatus.NotFound, 'User not found');
    }
    return user;
  }

  async getAllUsers(params: ListParams): Promise<UserListResponse> {
    const findOptions: FindManyOptions<User> = {
      order: {
        [params.sorting?.column ?? 'id']: params.sorting?.direction ?? 'ASC',
      },
      relations: ['roles'],
    };

    findOptions.where = addQueryWhereClause<User>(params, ['firstName', 'lastNamePreposition', 'lastName', 'email']);

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
    const users = await this.repo.find({
      select: ['id', 'firstName', 'lastNamePreposition', 'lastName', 'email', 'avatarFilename', 'backgroundFilename'],
      relations: ['roles'],
    });
    return users.map((u) => {
      return {
        id: u.id,
        firstName: u.firstName,
        lastNamePreposition: u.lastNamePreposition,
        lastName: u.lastName,
        email: u.email,
        avatarFilename: u.avatarFilename,
        backgroundFilename: u.backgroundFilename,
        roles: u.roles.map((r) => r.name),
      } as UserSummary;
    });
  }

  async deleteUser(id: number, actor: User): Promise<void> {
    if (id === actor.id) {
      throw new ApiError(HTTPStatus.BadRequest, 'You cannot delete yourself');
    }
    const user = await this.repo.findOne({ where: { id }, relations: ['roles'] });
    if (user == null) {
      throw new ApiError(HTTPStatus.NotFound, 'User not found');
    }
    await this.deleteUserAvatar(user.id);
    await this.deleteUserBackground(user.id);
    await this.repo.softDelete(user.id);
    await new AuthService().deleteIdentities(user.id);
  }

  async createUser(params: UserParams): Promise<User> {
    if (ldapEnabled())
      throw new ApiError(HTTPStatus.BadRequest, 'Cannot create a local user, because LDAP authentication is enabled');

    const { roles, ...userParams } = params;
    let user = this.repo.create(userParams);
    user = await this.repo.save(user);
    if (roles) {
      user = await this.assignRoles(user, roles);
    }

    await new AuthService().createIdentityLocal(user, false);
    return user;
  }

  async createAdminUser(params: UserParams): Promise<User | undefined> {
    if (ldapEnabled()) return Promise.resolve(undefined);

    if (!this.validateUserParams(params)) {
      throw new ApiError(HTTPStatus.BadRequest, 'The supplied parameters are not valid');
    }

    const adminUser = await this.repo.save({
      email: params.email,
      gender: params.gender,
      firstName: params.firstName,
      lastNamePreposition: params.lastNamePreposition,
      lastName: params.lastName,
      comment: params.comment,
      function: params.function,
    });

    return this.assignRoles(adminUser, [Roles.ADMIN, Roles.FINANCIAL, Roles.SIGNEE, Roles.GENERAL, Roles.AUDIT]);
  }

  async assignRoles(user: User, roles: Roles[]): Promise<User> {
    const newUser = user;

    newUser.roles = roles.map((r) => ({ name: r }) as Role);
    await this.repo.save(newUser);
    return newUser;
  }

  async updateUser(id: number, params: Partial<UserParams>, actor: User): Promise<User> {
    const { roles, ldapOverrideEmail, ...userParams } = params;
    await this.repo.update(id, userParams);
    let user = await this.repo.findOneBy({ id });

    if (user == null) {
      throw new ApiError(HTTPStatus.NotFound);
    }

    // Check if roles should be assigned. You can't update your own roles
    if (roles && id !== actor.id) {
      user = await this.assignRoles(user, roles);
    }

    // LDAP Identity update
    if (ldapOverrideEmail || ldapEnabled()) {
      await this.identityLdapRepo.update(id, {
        overrideEmail: ldapOverrideEmail,
      });
    }
    user = await this.getUser(user.id);
    return user;
  }

  private validateUserParams(params: UserParams): boolean {
    return (
      validator.isStrongPassword(params.password) &&
      validator.isEmail(params.email) &&
      !validator.isEmpty(params.firstName) &&
      !validator.isEmpty(params.lastName) &&
      !validator.isEmpty(params.email) &&
      !validator.isEmpty(params.gender)
    );
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
      FileHelper.removeFileAtLoc(path.join(__dirname, '/../../', uploadUserAvatarDirLoc, user.avatarFilename));
    } finally {
      await this.repo.update(user.id, { avatarFilename: '' });
    }

    return this.getUser(id);
  }

  async deleteUserBackground(id: number): Promise<User> {
    const user = await this.getUser(id);
    if (user.backgroundFilename === '') return user;
    try {
      FileHelper.removeFileAtLoc(path.join(__dirname, '/../../', uploadUserBackgroundDirLoc, user.backgroundFilename));
    } finally {
      await this.repo.update(user.id, { backgroundFilename: '' });
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
