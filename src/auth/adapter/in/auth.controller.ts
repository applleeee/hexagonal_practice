import { Controller, Post, Inject, Body } from '@nestjs/common';
import { IAuthService } from 'src/auth/domain/inboundPort/IAuth.service';
import { SignInData, SignUpData } from '../auth.dto';

@Controller('/auth')
export class AuthController {
  constructor(@Inject(IAuthService) private authService: IAuthService) {}

  @Post('/sign-up')
  async signUp(@Body() signUpData: SignUpData): Promise<{ token: string }> {
    return await this.authService.signUp(signUpData);
  }

  @Post('/sign-in')
  async signIn(@Body() signInData: SignInData): Promise<{ token: string }> {
    return await this.authService.signIn(signInData);
  }
}
