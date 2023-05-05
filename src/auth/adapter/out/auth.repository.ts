import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/User';
import { IAuthRepository } from 'src/auth/domain/outboundPort/IAuth.repository';
import { Repository } from 'typeorm';
import { SignUpData } from '../auth.dto';
import { Post } from 'entity/Post';
import { PostLike } from 'entity/PostLike';
import { Comment } from 'entity/Comment';
import { CommentLike } from 'entity/CommentLike';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  async createUser(signUpData: SignUpData): Promise<User> {
    const user = this.userRepository.create(signUpData);

    try {
      return await this.userRepository.save(user);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'USERNAME or EAMIL DUPLICATED',
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new HttpException(
          'NO USER WITH THIS EMAIL',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (err) {
      throw new HttpException(
        'FAILED TO FIND USER',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEmailByUserId(userId: number): Promise<string> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      return user.email;
    } catch (err) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
  }

  async getPostsCreatedByUser(userId: number): Promise<Post[]> {
    return this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id as id',
        'post.title as title',
        'sub_category.name as subCategory',
        `DATE_FORMAT(post.created_at, '%Y-%m-%d %H:%i:%s') as createdAt`,
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(post_like.id)', 'likeNumber')
          .from(PostLike, 'post_like')
          .where('post_like.post_id = post.id');
      }, 'likeNumber')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(comment.post_id)', 'commentNumber')
          .from(Comment, 'comment')
          .where('post.id = comment.post_id');
      }, 'commentNumber')
      .leftJoin(
        'sub_category',
        'sub_category',
        'sub_category.id = post.sub_category_id',
      )
      .where('post.user_id = :userId', { userId: userId })
      .groupBy('post.id')
      .getRawMany();
  }

  async getPostLikesCreatedByUser(userId: number): Promise<PostLike[]> {
    return this.postLikeRepository
      .createQueryBuilder('postLike')
      .select(['post_id'])
      .where('user_id = :userId', { userId })
      .getRawMany();
  }

  async getCommentsCreatedByUser(userId: number): Promise<Comment[]> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .select(['id', 'content', 'post_id as postId', 'created_at as createdAt'])
      .where('user_id = :userId', { userId })
      .getRawMany();
  }

  async getCommentLikesCreatedByUser(userId: number): Promise<CommentLike[]> {
    return this.commentLikeRepository
      .createQueryBuilder('commentLike')
      .select(['comment_id'])
      .where('user_id = :userId', { userId })
      .getRawMany();
  }
}
