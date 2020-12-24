import { getRepository, Repository } from 'typeorm';
import { ServerSetting } from '../entity/ServerSetting';
import { Gender, User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';
import AuthService from './AuthService';

export interface SetupParams {
  admin: {
    email: string;

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
    const { admin } = params;
    const adminUser = await userRepo.save({
      email: admin.email,
      gender: admin.gender,
      firstName: admin.firstName,
      middleName: admin.middleName,
      lastName: admin.lastName,
    });

    new AuthService().createIdentityLocal(adminUser);

    await this.setSetting({ name: 'SETUP_DONE', value: 'true' });
  }
}
