import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { AuthController } from './adapter/in/auth.controller';
import { IAuthService } from './domain/inboundPort/IAuth.service';
import { AuthService } from './domain/auth.service';
import { IAuthRepository } from './domain/outboundPort/IAuth.repository';
import { AuthRepository } from './adapter/out/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { PostLike } from 'entity/PostLike';
import { Comment } from 'entity/Comment';
import { CommentLike } from 'entity/CommentLike';
import { Post } from 'entity/Post';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, PostLike, Comment, CommentLike]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: `${process.env.JWT_EXPIRES_IN}s` },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },
  ],
})
export class AuthModule {}
