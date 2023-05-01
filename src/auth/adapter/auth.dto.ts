import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpData {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly userName: string;

  @IsNotEmpty()
  readonly password: string;
}

export class Payload {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly userName: string;
}
