import { Request } from 'express';

interface CustomBody {
  createdAt?: Date;
  name?: string;
  companyId?: number;
  rememberMe?: boolean;
}

export interface ExpressRequest extends Request {
  body: CustomBody;
}
