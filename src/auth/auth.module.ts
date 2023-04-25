import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { AuthController } from './adapter/in/auth.controller';
import { IAuthService } from './domain/inboundPort/IAuth.service';
import { AuthService } from './domain/auth.service';
import { IAuthRepository } from './domain/outboundPort/IAuth.repository';
import { AuthRepository } from './adapter/out/auth.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
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
export class CommunityModule {}
