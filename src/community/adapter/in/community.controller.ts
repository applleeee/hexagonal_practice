import { Controller, Get, Inject } from '@nestjs/common';
import { ICommunityService } from 'src/community/domain/inboundPort/ICommunity.service';

@Controller('/community')
export class CommunityController {
  constructor(
    @Inject(ICommunityService) private communityService: ICommunityService,
  ) {}

  @Get('/categories')
  async getAllCategories() {
    return await this.communityService.getAllcategories();
  }
}
