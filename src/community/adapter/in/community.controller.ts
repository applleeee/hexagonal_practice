import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICommunityService } from 'src/community/domain/inboundPort/ICommunity.service';
import { UserRequest } from '../community.interface';
import { JwtAuthGuard, OptionalAuthGuard } from 'src/auth/jwt.guard';
import {
  CreateCommentBodyDto,
  CreateCommentDto,
  CreateOrDeleteCommentLikesDto,
  CreatePostDto,
  DeleteCommentDto,
  DeleteImageDto,
  GetPostListDto,
  PostLikeDto,
  SearchPostDto,
  UpdateCommentDto,
} from './community.inputDto';
import { SubCategory } from 'entity/SubCategory';
import { DeleteObjectCommandOutput } from '@aws-sdk/client-s3';
import { ValidateSubCategoryIdPipe } from '../community.pipe';
import { PostDetail, PostList } from '../out/community.outputDto';

@Controller('/community')
export class CommunityController {
  constructor(
    @Inject(ICommunityService) private communityService: ICommunityService,
  ) {}

  @Get('/categories')
  async getAllCategories(): Promise<SubCategory[]> {
    return await this.communityService.getAllcategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/post/image')
  @UseInterceptors(FileInterceptor('image'))
  async saveImageToS3(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: UserRequest,
  ): Promise<string> {
    const userId: number = req.user.userId;
    return await this.communityService.saveImageToS3(image, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/post/image')
  async deleteImageInS3(
    @Body() toDeleteImageData: DeleteImageDto,
  ): Promise<DeleteObjectCommandOutput | { message: string }> {
    const { toDeleteImage } = toDeleteImageData;
    return await this.communityService.deleteImageInS3(toDeleteImage);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/post')
  async createPost(
    @Body() postData: CreatePostDto,
    @Req() req: UserRequest,
  ): Promise<{ message: string }> {
    const userId: number = req.user.userId;
    const { title, subCategoryId, content } = postData;
    await this.communityService.createPost(
      title,
      subCategoryId,
      content,
      userId,
    );
    return { message: 'post created' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/posts/update/:postId')
  async updatePost(
    @Param('postId') postId: number,
    @Body() updatedData: CreatePostDto,
    @Req() req: UserRequest,
  ): Promise<{ message: string }> {
    const { title, subCategoryId, content } = updatedData;
    const { idsOfPostsCreatedByUser, userId } = req.user;

    if (idsOfPostsCreatedByUser.includes(postId)) {
      await this.communityService.updatePost(
        postId,
        title,
        subCategoryId,
        content,
        userId,
      );
      return { message: 'post updated' };
    } else {
      throw new HttpException(
        'THIS_USER_HAS_NEVER_WRITTEN_THAT_POST',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/posts/:postId')
  async deletePost(
    @Param('postId') postId: number,
    @Req() req: UserRequest,
  ): Promise<{ message: string }> {
    const { idsOfPostsCreatedByUser } = req.user;

    if (idsOfPostsCreatedByUser.includes(postId)) {
      await this.communityService.deletePost(postId);
      return { message: 'post deleted' };
    } else {
      throw new HttpException(
        'THIS_USER_HAS_NEVER_WRITTEN_THAT_POST',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get('/posts/list/:subCategoryId')
  async getPostList(
    @Param('subCategoryId', ValidateSubCategoryIdPipe) subCategoryId: number,
    @Query() query: GetPostListDto,
  ): Promise<{ fixed: string; postLists: PostList[]; total: number }> {
    const { sort, date, offset, limit } = query;

    return await this.communityService.getPostList(
      subCategoryId,
      sort,
      date,
      offset,
      limit,
    );
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/posts/:postId')
  async getPostDetail(
    @Param('postId') postId: number,
    @Req() req: UserRequest,
  ): Promise<PostDetail> {
    const result = await this.communityService.getPostDetail(postId);

    if (req.user) {
      const { idsOfPostLikedByUser, idsOfPostsCreatedByUser } = req.user;
      result.isLogin = true;
      if (idsOfPostsCreatedByUser.includes(postId)) {
        result.isAuthor = true;
      } else {
        result.isAuthor = false;
      }
      if (idsOfPostLikedByUser.includes(postId)) {
        result.ifLiked = true;
      } else {
        result.ifLiked = false;
      }
      return result;
    }

    if (!req.user) {
      result.isLogin = false;
      return result;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/like')
  async createOrDeletePostLike(
    @Body() data: PostLikeDto,
    @Req() req: UserRequest,
  ): Promise<{ message: string }> {
    const { postId } = data;
    const { userId } = req.user;

    const result = await this.communityService.createOrDeletePostLike(
      postId,
      userId,
    );

    if (result['raw']) {
      return { message: 'like deleted' };
    } else {
      return { message: 'like created' };
    }
  }

  @Get('/search')
  async searchPost(
    @Query() query: SearchPostDto,
  ): Promise<{ postLists: PostList[]; total: number }> {
    const { option, keyword, offset, limit } = query;

    return await this.communityService.searchPost(
      option,
      keyword,
      offset,
      limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/posts/:post_id/comment')
  async createComment(
    @Body() body: CreateCommentBodyDto,
    @Req() req: UserRequest,
    @Param('post_id') postId: number,
  ) {
    const user = req.user;
    const commentData: CreateCommentDto = {
      userId: user.userId,
      postId,
      ...body,
    };
    return await this.communityService.createComment(user, commentData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/comments/:comment_id')
  async deleteComment(
    @Req() req,
    @Param('comment_id') commentId: number,
    @Body() body,
  ) {
    const criteria: DeleteCommentDto = {
      user: req.user,
      id: commentId,
      groupOrder: body.groupOrder,
      depth: body.depth,
      postId: body.postId,
    };

    return await this.communityService.deleteComment(criteria);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/comments/:comment_id')
  async updateComment(
    @Req() req,
    @Param('comment_id') commentId: number,
    @Body() body,
  ) {
    const content: string = body.content;
    const criteria: UpdateCommentDto = {
      user: req.user,
      id: commentId,
    };
    return await this.communityService.updateComment(criteria, content);
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/posts/:post_id/comments')
  async getComments(@Req() req, @Param('post_id') postId: number) {
    const user = req.user;
    return await this.communityService.getComments(user, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/comments/:comment_id/likes')
  async createOrDeleteCommentLikes(
    @Req() req,
    @Param('comment_id') commentId: number,
  ) {
    const criteria: CreateOrDeleteCommentLikesDto = {
      userId: req.user.id,
      commentId,
    };

    return await this.communityService.createOrDeleteCommentLikes(criteria);
  }
}
