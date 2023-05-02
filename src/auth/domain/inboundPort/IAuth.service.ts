import { SignInData, SignUpData } from 'src/auth/adapter/auth.dto';

export interface IAuthService {
  signUp(signUpData: SignUpData): Promise<{ token: string }>;

  signIn(signInData: SignInData): Promise<{ token: string }>;
}

export const IAuthService = Symbol('IAuthService');
