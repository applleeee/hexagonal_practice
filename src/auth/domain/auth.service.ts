import { Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './inboundPort/IAuth.service';
import { IAuthRepository } from './outboundPort/IAuth.repository';
import { Payload, SignUpData } from '../adapter/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IAuthRepository)
    private authRepository: IAuthRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpData: SignUpData) {
    const { email, userName } = signUpData;
    const payload = { email, userName };
    const jwt = await this.getJwtAccessToken(payload);
    const user = await this.authRepository.createUser(signUpData);
    return { token: jwt, userId: user.id };
  }

  async getJwtAccessToken(payload: Payload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: `${process.env.JWT_EXPIRES_IN}s`,
    });
  }
}
