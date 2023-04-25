import { Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './inboundPort/IAuth.service';
import { IAuthRepository } from './outboundPort/IAuth.repository';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IAuthRepository)
    private authRepository: IAuthRepository,
  ) {}

  getTest() {
    return 'asdfasdf';
  }
}
