import { getRepository, Repository } from 'typeorm';
import { User } from '../entity/User';
import { ApiError, HTTPStatus } from '../helpers/error';

export default class UserService {
  repo: Repository<User>;

  constructor() {
    this.repo = getRepository(User);
  }

  async getUser(id: number): Promise<User> {
    const user = await this.repo.findOne(id);
    if (user === undefined) {
      throw new ApiError(HTTPStatus.NotFound, 'Product not found');
    }
    return user;
  }

  createUser(firstName: string, lastName: string) {
    const user = {
      firstName,
      lastName,
      email: 'me@example.com',
    } as User;
    return this.repo.save(user);
  }
}
