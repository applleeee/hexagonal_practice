import { Post } from 'entity/Post';
import { PostLike } from 'entity/PostLike';
import { SubCategory } from 'entity/SubCategory';
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
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';

export interface ICommunityRepository {
  getAllCategories(): Promise<SubCategory[]>;

  createPost(
    title: string,
    subCategoryId: number,
    userId: number,
    contentUrl: string,
  ): Promise<InsertResult>;

  getPostById(postId: number): Promise<Post>;

  updatePost(
    postId: number,
    title: string,
    subCategoryId: number,
    contentUrl: string,
  ): Promise<UpdateResult>;

  deletePost(postId: number): Promise<DeleteResult>;

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

  getComments(postId: number);

  getReComments(postId: number);

  createComment(commentData: CreateCommentDto);

  isCommentExist(commentId);

  deleteComment(criteria);

  deleteReComment(criteria: DeleteCommentDto);

  updateComment(criteria: UpdateCommentDto, content: string);

  createOrDeleteCommentLikes(criteria: CreateOrDeleteCommentLikesDto);
}

export const ICommunityRepository = Symbol('ICommunityRepository');
