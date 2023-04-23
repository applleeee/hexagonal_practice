import { Controller, Get, Inject } from '@nestjs/common';
import { ICommunityService } from 'src/community/domain/inboundPort/ICommunity.service';

@Controller('/')
export class CommunityController {
  constructor(
    @Inject(ICommunityService) private boardsService: ICommunityService,
  ) {}

  @Get('/')
  async test() {
    return 'hi';
  }
}
