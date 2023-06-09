import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ICommunityService } from './inboundPort/ICommunity.service';
import { ICommunityRepository } from './outboundPort/ICommunity.repository';
import { deleteS3Data, getS3Data, uploadToS3 } from 'src/utils/awsS3';
import {
  CreateCommentDto,
  CreateOrDeleteCommentLikesDto,
  DateEnum,
  DeleteCommentDto,
  Depth,
  OptionEnum,
  SortEnum,
  UpdateCommentDto,
} from '../adapter/in/community.inputDto';
import { DeleteObjectsCommandOutput } from '@aws-sdk/client-s3';
import { PostDetail, PostList } from '../adapter/out/community.outputDto';
import { PostLike } from 'entity/PostLike';
import { DeleteResult } from 'typeorm';
import { AuthorizedUser } from 'src/auth/adapter/auth.dto';

@Injectable()
export class CommunityService implements ICommunityService {
  constructor(
    @Inject(ICommunityRepository)
    private communityRepository: ICommunityRepository,
  ) {}

  public getCurrentTime() {
    return new Date(+new Date() + 3240 * 10000)
      .toISOString()
      .replace('T', '_')
      .replace(/\..*/, '')
      .replace(/\:/g, '-');
  }

  async getAllcategories() {
    return this.communityRepository.getAllCategories();
  }

  async saveImageToS3(
    image: Express.Multer.File,
    userId: number,
  ): Promise<string> {
    const now = this.getCurrentTime();
    const name = `post_images/${userId}_${now}`;
    const mimetype = image.mimetype;

    try {
      const saveToS3 = await uploadToS3(image.buffer, name, mimetype);
      return saveToS3.Location;
    } catch (err) {
      throw new HttpException(
        'CANNOT_SAVE_IMAGE_TO_S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteImageInS3(
    toDeleteImage: string[],
  ): Promise<DeleteObjectsCommandOutput | { message: string }> {
    if (toDeleteImage.length !== 0) {
      try {
        return await deleteS3Data(toDeleteImage);
      } catch (err) {
        throw new HttpException(
          'CANNOT_DELETE_IMAGE_IN_S3',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return { message: 'No image to delete' };
  }

  async createPost(
    title: string,
    subCategoryId: number,
    content: string,
    userId: number,
  ): Promise<void> {
    const now = this.getCurrentTime();

    const contentUrl = `post/${userId}_${title}_${now}`;
    const mimetype = 'string';

    try {
      await uploadToS3(content as unknown as Buffer, contentUrl, mimetype);
    } catch (err) {
      throw new HttpException(
        'CANNOT_UPLOAD_POST_TO_S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.communityRepository.createPost(
        title,
        userId,
        subCategoryId,
        contentUrl,
      );
    } catch (err) {
      throw new HttpException(
        'CANNOT_SAVE_POST_IN_DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePost(
    postId: number,
    title: string,
    subCategoryId: number,
    content: string,
    userId: number,
  ): Promise<void> {
    const originPost = await this.communityRepository.getPostById(postId);

    try {
      await deleteS3Data([originPost.contentUrl]);
    } catch (err) {
      throw new HttpException(
        'CANNOT_DELETE_POST_IN_S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const now = this.getCurrentTime();

    const contentUrl = `post/${userId}_${title}_${now}`;
    const mimetype = 'string';
    try {
      await uploadToS3(content as unknown as Buffer, contentUrl, mimetype);
    } catch (err) {
      throw new HttpException(
        'CANNOT_UPLOAD_POST_TO_S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.communityRepository.updatePost(
      postId,
      title,
      subCategoryId,
      contentUrl,
    );
  }

  async deletePost(postId: number): Promise<void> {
    const originPost = await this.communityRepository.getPostById(postId);

    try {
      await deleteS3Data([originPost.contentUrl]);
    } catch (err) {
      throw new HttpException(
        'CANNOT_DELETE_POST_IN_S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await this.communityRepository.deletePost(postId);

    if (result.affected === 0) {
      throw new HttpException(
        `CANNOT_FIND_A_POST_WITH_ID_${postId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getPostList(
    subCategoryId: number,
    sort: SortEnum,
    date: DateEnum | undefined,
    offset: number,
    limit: number,
  ): Promise<{ fixed: string; postLists: PostList[]; total: number }> {
    try {
      return await this.communityRepository.getPostList(
        subCategoryId,
        sort,
        date,
        offset,
        limit,
      );
    } catch (err) {
      throw new HttpException(
        'CAANOT_GET_LIST_OF_POST_FROM_DATABASE',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostDetail(postId: number): Promise<PostDetail> {
    const postDetail = await this.communityRepository.getPostDetail(postId);

    try {
      const postContent = await getS3Data(postDetail.content);
      postDetail.content = postContent;
      return postDetail;
    } catch (err) {
      throw new HttpException(
        'CANNOT_GET_POST_FROM_S3',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrDeletePostLike(
    postId: number,
    userId: number,
  ): Promise<PostLike | DeleteResult> {
    try {
      return await this.communityRepository.createOrDeletePostLike(
        postId,
        userId,
      );
    } catch (err) {
      throw new HttpException(
        'CANNOT_SAVE_OR_DELETE_POST_LIKE_IN_DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchPost(
    option: OptionEnum,
    keyword: string,
    offset: number,
    limit: number,
  ): Promise<{ postLists: PostList[]; total: number }> {
    try {
      return await this.communityRepository.searchPost(
        option,
        keyword,
        offset,
        limit,
      );
    } catch (err) {
      throw new HttpException(
        'FAIL_TO_SEARCH_IN_DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createComment(user: AuthorizedUser, commentData: CreateCommentDto) {
    const comments = await this.getComments(user, commentData.postId);
    const groupOrderArr = comments?.map((comment) => comment.groupOrder);

    if (
      groupOrderArr.indexOf(commentData.groupOrder) === -1 &&
      commentData.depth === Depth.RE_COMMENT
    )
      throw new HttpException(
        'CANNOT_CREATE_RE_COMMENT_WITHOUT_COMMENT',
        HttpStatus.BAD_REQUEST,
      );

    if (
      groupOrderArr.length > 0 &&
      commentData.groupOrder <= groupOrderArr[groupOrderArr?.length - 1] &&
      commentData.depth === Depth.COMMENT
    )
      throw new HttpException(
        'ALREADY_EXIST_COMMENT_IN_THE_GROUP_ORDER',
        HttpStatus.BAD_REQUEST,
      );

    return await this.communityRepository.createComment(commentData);
  }

  async getComments(user, postId: number) {
    const comments = await this.communityRepository.getComments(postId);

    if (comments === undefined) comments;

    if (user !== false)
      comments.map((comment) => {
        comment.isCreatedByUser =
          user?.idsOfCommentsCreatedByUser?.indexOf(comment.commentId) >= 0
            ? true
            : false;
        comment.isLikedByUser =
          user?.idsOfCommentLikedByUser?.indexOf(comment.commentId) >= 0
            ? true
            : false;
      });

    let reComments = await this.communityRepository.getReComments(postId);

    if (reComments !== undefined && user.id !== undefined) {
      reComments.map((reComment) => {
        reComment.isCreatedByUser =
          user?.idsOfCommentsCreatedByUser?.indexOf(reComment.commentId) >= 0
            ? true
            : false;
        reComment.isLikedByUser =
          user?.idsOfCommentLikedByUser?.indexOf(reComment.commentId) >= 0
            ? true
            : false;
      });
    }

    if (reComments === undefined) {
      reComments = [];
    }

    comments.map((comment) => {
      return (comment.reComments = reComments?.filter((reComment) => {
        return reComment['groupOrder'] === comment['groupOrder'];
      }));
    });

    return comments;
  }

  async deleteComment(criteria: DeleteCommentDto) {
    const isCommentExist = await this.communityRepository.isCommentExist(
      criteria.id,
    );

    if (!isCommentExist)
      throw new HttpException('THE_COMMENT_IS_NOT_EXIST', HttpStatus.NOT_FOUND);

    const commentIdsCreatedByUser = criteria.user
      .idsOfCommentsCreatedByUser as unknown[];

    if (commentIdsCreatedByUser?.indexOf(criteria.id) === -1)
      throw new HttpException('NOT_CREATED_BY_USER', HttpStatus.FORBIDDEN);

    // 대댓글인 경우 해당 댓글만 삭제
    if (criteria.depth === 2) {
      await this.communityRepository.deleteReComment(criteria);
    }

    // 댓글인 경우 해당 groupOrder에 있는 depth 2인 댓글 전체 삭제
    if (criteria.depth === 1)
      await this.communityRepository.deleteComment({
        groupOrder: criteria.groupOrder,
        postId: criteria.postId,
      });
  }

  async updateComment(criteria: UpdateCommentDto, content: string) {
    const commentIdsCreatedByUser = criteria.user
      .idsOfCommentsCreatedByUser as unknown[];

    const isCommentExist = await this.communityRepository.isCommentExist(
      criteria.id,
    );

    if (!isCommentExist)
      throw new HttpException('THE_COMMENT_IS_NOT_EXIST', HttpStatus.NOT_FOUND);

    if (commentIdsCreatedByUser?.indexOf(criteria.id) === -1)
      throw new HttpException('NOT_CREATED_BY_USER', HttpStatus.FORBIDDEN);

    await this.communityRepository.updateComment(criteria, content);

    return { message: 'COMMENT_UPDATED' };
  }

  async createOrDeleteCommentLikes(criteria: CreateOrDeleteCommentLikesDto) {
    const isCommentExist = await this.communityRepository.isCommentExist(
      criteria.commentId,
    );

    if (!isCommentExist)
      throw new HttpException('THE_COMMENT_IS_NOT_EXIST', HttpStatus.NOT_FOUND);

    return await this.communityRepository.createOrDeleteCommentLikes(criteria);
  }
}
