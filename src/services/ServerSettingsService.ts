import {
  getRepository, Repository,
} from 'typeorm';
import { ServerSetting } from '../entity/ServerSetting';
import { ApiError, HTTPStatus } from '../helpers/error';
import AuthService from './AuthService';
import UserService, { UserParams } from './UserService';
import { ldapEnabled } from '../auth';

export interface SetupParams {
  admin: UserParams,
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

  async initialSetup(
    params: SetupParams,
  ): Promise<void> {
    if ((await this.getSetting('SETUP_DONE'))?.value === 'true') {
      throw new ApiError(HTTPStatus.Forbidden, 'Server is already set up');
    }

    const { admin } = params;
    const adminUser = await new UserService()
      .createAdminUser(admin);

    new AuthService().createIdentityLocal(adminUser, ldapEnabled());

    await this.setSetting({ name: 'SETUP_DONE', value: 'true' });
  }
}
