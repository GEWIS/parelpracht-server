import { User as EntityUser } from './entity/User';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends EntityUser {}
  }
}
