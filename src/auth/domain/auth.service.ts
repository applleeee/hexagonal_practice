import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './inboundPort/IAuth.service';
import { IAuthRepository } from './outboundPort/IAuth.repository';
import { Payload, SignInData, SignUpData } from '../adapter/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Post } from 'entity/Post';
import { Comment } from 'entity/Comment';
import { PostLike } from 'entity/PostLike';
import { CommentLike } from 'entity/CommentLike';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IAuthRepository)
    private authRepository: IAuthRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpData: SignUpData): Promise<{ token: string }> {
    const { email } = signUpData;
    const user = await this.authRepository.createUser(signUpData);

    const payload = { email, userId: user.id };
    const jwt = await this.getJwtAccessToken(payload);
    return { token: jwt };
  }

  async getJwtAccessToken(payload: Payload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: `${process.env.JWT_EXPIRES_IN}s`,
    });
  }

  async signIn(signInData: SignInData): Promise<{ token: string }> {
    const { email, password } = signInData;
    const user = await this.authRepository.getUserByEmail(email);

    if (user.password === password) {
      const payload = { email, userId: user.id };
      const jwt = await this.getJwtAccessToken(payload);
      return { token: jwt };
    } else {
      throw new HttpException('WRONG PASSWORD', HttpStatus.UNAUTHORIZED);
    }
  }

  async getIdsOfPostsCreatedByUser(userId: number): Promise<number[]> {
    const data: Post[] = await this.authRepository.getPostsCreatedByUser(
      userId,
    );
    return data?.map<Post['id']>((post: Post) => Object.values(post)[0]);
  }

  async getIdsOfPostLikedByUser(userId: number): Promise<number[]> {
    const data: PostLike[] =
      await this.authRepository.getPostLikesCreatedByUser(userId);
    return data?.map<PostLike['id']>(
      (postLike: PostLike) => Object.values(postLike)[0],
    );
  }

  async getIdsOfCommentCreatedByUser(userId: number): Promise<number[]> {
    const data: Comment[] = await this.authRepository.getCommentsCreatedByUser(
      userId,
    );
    return data?.map<Comment['id']>(
      (comment: Comment) => Object.values(comment)[0],
    );
  }

  async getIdsOfCommentLikedByUser(userId: number): Promise<number[]> {
    const data: CommentLike[] =
      await this.authRepository.getCommentLikesCreatedByUser(userId);
    return data?.map<CommentLike['id']>(
      (commentLike: CommentLike) => Object.values(commentLike)[0],
    );
  }
}
