import { User } from 'entity/User';
import { SignUpData } from 'src/auth/adapter/auth.dto';

export interface IAuthRepository {
  createUser(signUpData: SignUpData): Promise<User>;
}

export const IAuthRepository = Symbol('IAuthRepository');
