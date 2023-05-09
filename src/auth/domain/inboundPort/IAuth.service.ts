import { SignInData, SignUpData } from 'src/auth/adapter/auth.dto';

export interface IAuthService {
  signUp(signUpData: SignUpData): Promise<{ token: string }>;

  signIn(signInData: SignInData): Promise<{ token: string }>;

  getIdsOfPostsCreatedByUser(userId: number): Promise<number[]>;

  getIdsOfPostLikedByUser(userId: number): Promise<number[]>;

  getIdsOfCommentCreatedByUser(userId: number): Promise<number[]>;

  getIdsOfCommentLikedByUser(userId: number): Promise<number[]>;
}

export const IAuthService = Symbol('IAuthService');
