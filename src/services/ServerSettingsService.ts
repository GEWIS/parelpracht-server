import { getRepository, Repository } from 'typeorm';
import crypto from 'crypto';
import { generateSalt, hashPassword } from '../auth/LocalStrategy';
import { IdentityLocal } from '../entity/IdentityLocal';
import { ServerSetting } from '../entity/ServerSetting';
import { Gender, User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';

export interface SetupParams {
  admin: {
    email: string;
    password: string;

    gender: Gender;
    firstName: string;
    middleName: string;
    lastName: string;
  }
}

export default class ServerSettingsService {
  repo: Repository<ServerSetting>;

  constructor() {
    this.repo = getRepository(ServerSetting);
  }

  async setSetting(setting: ServerSetting): Promise<void> {
    await this.repo.save(setting);
  }

  async getSetting(name: string): Promise<ServerSetting | undefined> {
    return this.repo.findOne(name);
  }

  async initialSetup(params: SetupParams): Promise<void> {
    if ((await this.getSetting('SETUP_DONE'))?.value === 'true') {
      throw new ApiError(HTTPStatus.Forbidden, 'Server is already set up');
    }

    const userRepo = getRepository(User);
    const identityRepo = getRepository(IdentityLocal);
    const { admin } = params;
    const adminUser = await userRepo.save({
      email: admin.email,
      gender: admin.gender,
      firstName: admin.firstName,
      middleName: admin.middleName,
      lastName: admin.lastName,
    });

    const salt = generateSalt();
    await identityRepo.save({
      userId: adminUser.id,
      email: admin.email,
      verifiedEmail: true,
      hash: hashPassword(admin.password, salt),
      salt,
    });

    await this.setSetting({ name: 'SETUP_DONE', value: 'true' });
  }
}
