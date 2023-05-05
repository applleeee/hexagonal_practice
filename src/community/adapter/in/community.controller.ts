import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICommunityService } from 'src/community/domain/inboundPort/ICommunity.service';
import { UserRequest } from '../community.interface';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('/community')
export class CommunityController {
  constructor(
    @Inject(ICommunityService) private communityService: ICommunityService,
  ) {}

  @Get('/categories')
  async getAllCategories() {
    return await this.communityService.getAllcategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/post/image')
  @UseInterceptors(FileInterceptor('image'))
  async saveImageToS3(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: UserRequest,
  ) {
    const userId: number = req.user.userId;
    return await this.communityService.saveImageToS3(image, userId);
  }
}
