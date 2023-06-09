import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { AuthorizedUser } from 'src/auth/adapter/auth.dto';

export enum SortEnum {
  latest = 'latest',
  mostLiked = 'mostLiked',
}

export enum DateEnum {
  all = 'all',
  year = 'year',
  month = 'month',
  week = 'week',
  day = 'day',
}

export enum OptionEnum {
  title = 'title',
  author = 'author',
  title_author = 'title_author',
}

export enum Depth {
  COMMENT = 1,
  RE_COMMENT,
}

export class GetPostListDto {
  @IsNotEmpty()
  @IsEnum(SortEnum)
  readonly sort: SortEnum;

  @IsOptional()
  @IsEnum(DateEnum)
  readonly date: DateEnum;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly offset: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly limit: number;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsNumber()
  @IsNotEmpty()
  readonly subCategoryId: number;

  @IsString()
  @IsNotEmpty()
  readonly content: string;
}

export class DeleteImageDto {
  @IsOptional()
  readonly toDeleteImage: string[];
}

export class PostLikeDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly postId: number;
}

export class SearchPostDto {
  @IsNotEmpty()
  @IsEnum(OptionEnum)
  readonly option: OptionEnum;

  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly offset: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly limit: number;
}

export class CreateCommentBodyDto {
  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsNumber()
  @IsNotEmpty()
  readonly groupOrder: number;

  @IsEnum(Depth)
  @IsNotEmpty()
  readonly depth: Depth;
}

export class CreateCommentDto extends CreateCommentBodyDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly postId: number;
}

export class UpdateCommentDto {
  @IsNumber()
  @IsNotEmpty()
  readonly user: AuthorizedUser;

  @IsNumber()
  @IsNotEmpty()
  readonly id: number;
}

export class DeleteCommentDto extends UpdateCommentDto {
  @IsNumber()
  @IsNotEmpty()
  readonly groupOrder: number;

  @IsNumber()
  @IsNotEmpty()
  readonly postId: number;

  @IsEnum(Depth)
  @IsNotEmpty()
  readonly depth: Depth;
}

export class CreateOrDeleteCommentLikesDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly commentId: number;
}
