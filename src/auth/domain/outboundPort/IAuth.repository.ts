import { Comment } from 'entity/Comment';
import { CommentLike } from 'entity/CommentLike';
import { Post } from 'entity/Post';
import { PostLike } from 'entity/PostLike';
import { User } from 'entity/User';
import { SignUpData } from 'src/auth/adapter/auth.dto';

export interface IAuthRepository {
  createUser(signUpData: SignUpData): Promise<User>;

  getUserByEmail(email: string): Promise<User>;

  getEmailByUserId(userId: number): Promise<string>;

  getPostsCreatedByUser(userId: number): Promise<Post[]>;

  getPostLikesCreatedByUser(userId: number): Promise<PostLike[]>;

  getCommentsCreatedByUser(userId: number): Promise<Comment[]>;

  getCommentLikesCreatedByUser(userId: number): Promise<CommentLike[]>;
}

export const IAuthRepository = Symbol('IAuthRepository');
