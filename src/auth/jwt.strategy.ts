import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { AuthorizedUser, Payload } from './adapter/auth.dto';
import { IAuthService } from './domain/inboundPort/IAuth.service';
import { IAuthRepository } from './domain/outboundPort/IAuth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(IAuthService)
    private readonly AuthService: IAuthService,
    @Inject(IAuthRepository)
    private readonly AuthRepository: IAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload): Promise<AuthorizedUser> {
    const { email, userId } = payload;

    const emailInDb = await this.AuthRepository.getEmailByUserId(userId);

    if (emailInDb !== email)
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);

    const idsOfPostsCreatedByUser: number[] =
      await this.AuthService.getIdsOfPostsCreatedByUser(userId);

    const idsOfPostLikedByUser: number[] =
      await this.AuthService.getIdsOfPostLikedByUser(userId);

    const idsOfCommentsCreatedByUser: number[] =
      await this.AuthService.getIdsOfCommentCreatedByUser(userId);

    const idsOfCommentLikedByUser: number[] =
      await this.AuthService.getIdsOfCommentLikedByUser(userId);

    const user = {
      userId,
      email,
      idsOfPostsCreatedByUser,
      idsOfPostLikedByUser,
      idsOfCommentsCreatedByUser,
      idsOfCommentLikedByUser,
    };

    return user;
  }
}
