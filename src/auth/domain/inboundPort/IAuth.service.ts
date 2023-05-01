import { SignUpData } from 'src/auth/adapter/auth.dto';

export interface IAuthService {
  signUp(SignUpData: SignUpData): Promise<{ token: string; userId: number }>;
}

export const IAuthService = Symbol('IAuthService');
