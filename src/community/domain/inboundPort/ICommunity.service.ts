import { DeleteObjectsCommandOutput } from '@aws-sdk/client-s3';
import { PostLike } from 'entity/PostLike';
import { SubCategory } from 'entity/SubCategory';
import { AuthorizedUser } from 'src/auth/adapter/auth.dto';
import {
  CreateCommentDto,
  CreateOrDeleteCommentLikesDto,
  DateEnum,
  DeleteCommentDto,
  OptionEnum,
  SortEnum,
  UpdateCommentDto,
} from 'src/community/adapter/in/community.inputDto';
import {
  PostDetail,
  PostList,
} from 'src/community/adapter/out/community.outputDto';
import { DeleteResult } from 'typeorm';

export interface ICommunityService {
  getAllcategories(): Promise<SubCategory[]>;

  saveImageToS3(image: Express.Multer.File, userId: number): Promise<string>;

  deleteImageInS3(
    toDeleteImage: string[],
  ): Promise<DeleteObjectsCommandOutput | { message: string }>;

  createPost(
    title: string,
    subCategoryId: number,
    content: string,
    userId: number,
  ): Promise<void>;

  updatePost(
    postId: number,
    title: string,
    subCategoryId: number,
    content: string,
    userId: number,
  ): Promise<void>;

  deletePost(postId: number): Promise<void>;

  getPostList(
    subCategoryId: number,
    sort: SortEnum,
    date: DateEnum | undefined,
    offset: number,
    limit: number,
  ): Promise<{ fixed: string; postLists: PostList[]; total: number }>;

  getPostDetail(postId: number): Promise<PostDetail>;

  createOrDeletePostLike(
    postId: number,
    userId: number,
  ): Promise<PostLike | DeleteResult>;

  searchPost(
    option: OptionEnum,
    keyword: string,
    offset: number,
    limit: number,
  ): Promise<{ postLists: PostList[]; total: number }>;

  createComment(user: AuthorizedUser, commentData: CreateCommentDto);

  deleteComment(criteria: DeleteCommentDto);

  updateComment(criteria: UpdateCommentDto, content: string);

  getComments(user, postId: number);

  createOrDeleteCommentLikes(criteria: CreateOrDeleteCommentLikesDto);
}

export const ICommunityService = Symbol('ICommunityService');
