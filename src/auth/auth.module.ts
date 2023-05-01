import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { AuthController } from './adapter/in/auth.controller';
import { IAuthService } from './domain/inboundPort/IAuth.service';
import { AuthService } from './domain/auth.service';
import { IAuthRepository } from './domain/outboundPort/IAuth.repository';
import { AuthRepository } from './adapter/out/auth.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: `${process.env.JWT_EXPIRES_IN}s` },
    }),
  ],
  controllers: [AuthController],
  providers: [
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
