import { Repository } from 'typeorm';
import { ServerSetting } from '../entity/ServerSetting';
import { ApiError, HTTPStatus } from '../helpers/error';
import { ldapEnabled } from '../auth';
import AppDataSource from '../database';
import { User } from '../entity/User';
import UserService, { UserParams } from './UserService';
import AuthService from './AuthService';

export interface SetupParams {
  admin: UserParams;
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

  async initialSetup(params: SetupParams): Promise<User | undefined> {
    if ((await this.getSetting('SETUP_DONE'))?.value === 'true') {
      throw new ApiError(HTTPStatus.Forbidden, 'Server is already set up');
    }

    if (!ldapEnabled()) {
      const { admin } = params;
      const adminUser = await new UserService().createAdminUser(admin);

      const authService = new AuthService();

      const identity = await authService.createIdentityLocal(adminUser!, true);
      await authService.resetPassword(params.admin.password, authService.getSetPasswordToken(adminUser!, identity));

      await this.setSetting({ name: 'SETUP_DONE', value: 'true' });
      return adminUser!;
    }
    return undefined;
  }
}
