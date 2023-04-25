import { Controller, Post, Inject, Body } from '@nestjs/common';
import { IAuthService } from 'src/auth/domain/inboundPort/IAuth.service';

@Controller('/auth')
export class AuthController {
  constructor(@Inject(IAuthService) private authService: IAuthService) {}

  @Post('/sign-up')
  async signUp(@Body() signUpData) {}
}
