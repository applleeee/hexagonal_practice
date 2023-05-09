import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpData {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly userName: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

export class SignInData {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

export class Payload {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: number;
}

export class AuthorizedUser {
  readonly userId: number;

  readonly email: string;

  readonly idsOfPostsCreatedByUser: number[];

  readonly idsOfPostLikedByUser: number[];

  readonly idsOfCommentsCreatedByUser: number[];

  readonly idsOfCommentLikedByUser: number[];
}
