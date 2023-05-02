import { User } from 'entity/User';
import { SignInData, SignUpData } from 'src/auth/adapter/auth.dto';

export interface IAuthRepository {
  createUser(signUpData: SignUpData): Promise<User>;

  getUserByEmail(email: string): Promise<User>;
}

export const IAuthRepository = Symbol('IAuthRepository');
