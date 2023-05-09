import { Request } from 'express';
import { AuthorizedUser } from 'src/auth/adapter/auth.dto';

export interface UserRequest extends Request {
  user: AuthorizedUser;
}
