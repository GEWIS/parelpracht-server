import { Request } from 'express';
import { User as EntityUser } from './entity/User';

interface CustomBody {
  createdAt?: Date;
  name?: string;
  companyId?: number;
  rememberMe?: boolean;
}

export type ExpressRequest<Params = object, ResBody = object, ReqBody = CustomBody, ReqQuery = object> = Request<
  Params,
  ResBody,
  ReqBody,
  ReqQuery
>;

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends EntityUser {}
  }
}
