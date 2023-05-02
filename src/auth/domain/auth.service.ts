import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './inboundPort/IAuth.service';
import { IAuthRepository } from './outboundPort/IAuth.repository';
import { Payload, SignInData, SignUpData } from '../adapter/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IAuthRepository)
    private authRepository: IAuthRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpData: SignUpData): Promise<{ token: string }> {
    const { email, userName } = signUpData;
    const payload = { email, userName };
    const jwt = await this.getJwtAccessToken(payload);
    await this.authRepository.createUser(signUpData);
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
      const payload = { email, userName: user.userName };
      const jwt = await this.getJwtAccessToken(payload);
      return { token: jwt };
    } else {
      throw new HttpException('WRONG PASSWORD', HttpStatus.UNAUTHORIZED);
    }
  }
}
