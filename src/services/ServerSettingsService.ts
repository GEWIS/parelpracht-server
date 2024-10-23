import {
  Repository,
} from 'typeorm';
import { ServerSetting } from '../entity/ServerSetting';
import { ApiError, HTTPStatus } from '../helpers/error';
import AuthService from './AuthService';
import UserService, { UserParams } from './UserService';
import { ldapEnabled } from '../auth';
import AppDataSource from '../database';

export interface SetupParams {
  admin: UserParams,
}

export default class ServerSettingsService {
  repo: Repository<ServerSetting>;

  constructor() {
    this.repo = AppDataSource.getRepository(ServerSetting);
  }

  async setSetting(setting: ServerSetting): Promise<void> {
    await this.repo.save(setting);
  }

  async getSetting(name: string): Promise<ServerSetting | null> {
    return this.repo.findOneBy({ name });
  }

  async initialSetup(
    params: SetupParams,
  ): Promise<string> {
    if ((await this.getSetting('SETUP_DONE'))?.value === 'true') {
      throw new ApiError(HTTPStatus.Forbidden, 'Server is already set up');
    }

    if (!ldapEnabled()) {
      const { admin } = params;
      const adminUser = await new UserService()
        .createAdminUser(admin);

      const authService: AuthService = new AuthService();

      const $identity = await authService.createIdentityLocal(adminUser!, ldapEnabled());

      await this.setSetting({ name: 'SETUP_DONE', value: 'true' });
      return authService.getSetPasswordToken(adminUser!, $identity);
    }
    return '';
  }
}
