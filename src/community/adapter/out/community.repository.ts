import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'entity/Post';
import { SubCategory } from 'entity/SubCategory';
import { ICommunityRepository } from 'src/community/domain/outboundPort/ICommunity.repository';
import {
  DeleteResult,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import {
  CreateCommentDto,
  CreateOrDeleteCommentLikesDto,
  DateEnum,
  DeleteCommentDto,
  OptionEnum,
  SortEnum,
  UpdateCommentDto,
} from '../in/community.inputDto';
import { PostDetail, PostList } from './community.outputDto';
import { PostLike } from 'entity/PostLike';
import { Comment } from 'entity/Comment';
import { CommentLike } from 'entity/CommentLike';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(
    @InjectRepository(SubCategory)
    private subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  private postList(offset?: number, limit?: number): SelectQueryBuilder<Post> {
    return this.postRepository
      .createQueryBuilder()
      .select([
        'post.id as postId',
        'post.title',
        'post.view',
        'DATE_FORMAT(post.created_at, "%Y-%m-%d %H:%i:%s") AS createdAt',
        'user.id as userId',
        'user.username AS userName',
        'COUNT(DISTINCT post_like.id) AS postLike',
        'COUNT(DISTINCT comment.id) AS comment',
        'sub_category.name AS subCategoryName',
      ])
      .from(Post, 'post')
      .leftJoin('post.user', 'user')
      .leftJoin('post.postLikes', 'post_like')
      .leftJoin('post.comments', 'comment')
      .leftJoin('post.subCategory', 'sub_category')
      .groupBy('post.id')
      .addGroupBy('user.username')
      .offset(offset)
      .limit(limit);
  }

  async getAllCategories() {
    return await this.subCategoryRepository.find();
  }

  async createPost(
    title: string,
    subCategoryId: number,
    userId: number,
    contentUrl: string,
  ): Promise<InsertResult> {
    const result = await this.postRepository
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        title: title,
        contentUrl: contentUrl,
        userId: userId,
        subCategoryId: subCategoryId,
      })
      .execute();
    return result;
  }

  async getPostById(postId: number): Promise<Post> {
    return await this.postRepository.findOne({ where: { id: postId } });
  }

  async updatePost(
    postId: number,
    title: string,
    subCategoryId: number,
    contentUrl: string,
  ): Promise<UpdateResult> {
    return await this.postRepository
      .createQueryBuilder()
      .update(Post)
      .set({
        title: title,
        contentUrl: contentUrl,
        subCategoryId: subCategoryId,
      })
      .where('id = :id', { id: postId })
      .execute();
  }

  async deletePost(postId: number): Promise<DeleteResult> {
    return await this.postRepository.delete({ id: postId });
  }

  async getPostList(
    subCategoryId: number,
    sort: SortEnum,
    date: DateEnum | undefined,
    offset: number,
    limit: number,
  ): Promise<{ fixed: string; postLists: PostList[]; total: number }> {
    // const queryBuilderForFixed = this.postList();
    const queryBuilderForCount = this.postList();
    const queryBuilderForData = this.postList(offset, limit);

    // queryBuilderForFixed.where('post.fixedCategoryId = :subCategoryId', {
    //   subCategoryId: subCategoryId,
    // });

    if (subCategoryId !== 1) {
      queryBuilderForCount.where('post.subCategoryId = :subCategoryId', {
        subCategoryId: subCategoryId,
      });
      queryBuilderForData.where('post.subCategoryId = :subCategoryId', {
        subCategoryId: subCategoryId,
      });
    }

    if (sort === 'latest') {
      queryBuilderForData.orderBy('post.created_at', 'DESC');
    }

    if (sort === 'mostLiked' && date !== undefined) {
      if (date !== 'all') {
        queryBuilderForData
          .orderBy('postLike', 'DESC')
          .andWhere(
            `DATE_FORMAT(post.created_at, "%Y-%m-%d") >= DATE_SUB(NOW(), INTERVAL 1 ${date})`,
          );
        queryBuilderForCount.andWhere(
          `DATE_FORMAT(post.created_at, "%Y-%m-%d") >= DATE_SUB(NOW(), INTERVAL 1 ${date})`,
        );
      } else if (date === 'all') {
        queryBuilderForData.orderBy('postLike', 'DESC');
      }
    }

    // const fixed = await queryBuilderForFixed.getRawMany();
    const total = await queryBuilderForCount.getCount();
    const data = await queryBuilderForData.getRawMany();
    return { fixed: 'fixed', postLists: data, total: total };
  }

  async getPostDetail(postId: number): Promise<PostDetail> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoin('user', 'user', 'user.id = post.user_id')
      .leftJoin(
        'sub_category',
        'sub_category',
        'post.sub_category_id = sub_category.id',
      )
      .leftJoin('post_like', 'post_like', 'post_like.post_id = post.id')
      .select([
        'post.title AS postTitle',
        'post.id AS postId',
        'post.user_id AS userId',
        'post.content_url AS content',
        'user.username AS userName',
        'post.sub_category_id AS subCategoryId',
        'sub_category.name AS subCategoryName',
        "DATE_FORMAT(post.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt",
      ])
      .addSelect(
        `(SELECT JSON_ARRAYAGG(JSON_OBJECT("likeId", post_like.id, "userId", post_like.user_id, "createdAt", post_like.created_at))
      from post_like where post_like.post_id = post.id) as likes`,
      )
      .where('post.id = :id', { id: postId })
      .getRawOne();
  }

  async createOrDeletePostLike(
    postId: number,
    userId: number,
  ): Promise<PostLike | DeleteResult> {
    const ifLiked = await this.postLikeRepository.findOne({
      where: { postId: postId, userId: userId },
    });

    if (!ifLiked) {
      const postLike = new PostLike();
      postLike.postId = postId;
      postLike.userId = userId;

      return await this.postLikeRepository.save(postLike);
    } else if (ifLiked) {
      return await this.postLikeRepository.delete({ id: ifLiked.id });
    }
  }

  async searchPost(
    option: OptionEnum,
    keyword: string,
    offset: number,
    limit: number,
  ) {
    const queryBuilder = this.postList(offset, limit);

    if (option === 'title') {
      queryBuilder.where('post.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    } else if (option === 'author') {
      queryBuilder.where('ranker_profile.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    } else if (option === 'title_author') {
      queryBuilder
        .where('post.title LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .orWhere('user.userName LIKE :keyword', {
          keyword: `%${keyword}%`,
        });
    }
    const data = await queryBuilder.getRawMany();
    const total = await queryBuilder.getCount();
    return { postLists: data, total: total };
  }

  async getComments(postId: number) {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment.user_id as userId',
        'comment.group_order as groupOrder',
        'comment.id as commentId',
        'user.userName as userName',
        'comment.content as content',
        'comment.depth as depth',
        `DATE_FORMAT(comment.created_at, '%Y-%m-%d %H:%i:%s') as createdAt`,
        `DATE_FORMAT(comment.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt`,
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(comment_like.id)', 'likeNumber')
          .from(CommentLike, 'comment_like')
          .where('comment.id = comment_like.comment_id');
      }, 'likeNumber')
      .leftJoin('user', 'user', 'comment.user_id = user.id')
      .where('comment.post_id = :postId AND comment.depth = 1', {
        postId: postId,
      })
      .orderBy('comment.group_order', 'ASC')
      .addOrderBy('comment.created_at', 'ASC')
      .getRawMany();
  }

  async getReComments(postId: number) {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment.user_id as userId',
        'comment.group_order as groupOrder',
        'comment.id as commentId',
        'user.userName as userName',
        'comment.content as content',
        'comment.depth as depth',
        `DATE_FORMAT(comment.created_at, '%Y-%m-%d %H:%i:%s') as createdAt`,
        `DATE_FORMAT(comment.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt`,
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(comment_like.id)', 'likeNumber')
          .from(CommentLike, 'comment_like')
          .where('comment.id = comment_like.comment_id');
      }, 'likeNumber')
      .leftJoin('user', 'user', 'comment.user_id = user.id')
      .where('comment.post_id = :postId AND comment.depth = 2', {
        postId: postId,
      })
      .orderBy('comment.group_order', 'ASC')
      .addOrderBy('comment.created_at', 'ASC')
      .getRawMany();
  }

  async createComment(commentData: CreateCommentDto) {
    const data = this.commentRepository.create(commentData);
    return await this.commentRepository.save(data);
  }

  async isCommentExist(commentId: number) {
    return await this.commentRepository.exist({ where: { id: commentId } });
  }

  async deleteComment(criteria) {
    return await this.commentRepository.delete(criteria);
  }

  async deleteReComment(criteria: DeleteCommentDto) {
    return await this.commentRepository.delete(criteria);
  }

  async updateComment(criteria: UpdateCommentDto, content: string) {
    return await this.commentRepository
      .createQueryBuilder()
      .update(Comment)
      .set({
        content: content,
      })
      .where(`id = ${criteria.id} AND user_id = ${criteria.user.userId}`)
      .execute();
  }

  async createOrDeleteCommentLikes(criteria: CreateOrDeleteCommentLikesDto) {
    const isExist = await this.commentLikeRepository.exist({
      where: { ...criteria },
    });

    if (!isExist) return await this.commentLikeRepository.save(criteria);

    return await this.commentLikeRepository.delete(criteria);
  }
}
