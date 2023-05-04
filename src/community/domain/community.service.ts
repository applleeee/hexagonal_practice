import { Inject, Injectable } from '@nestjs/common';
import { ICommunityService } from './inboundPort/ICommunity.service';
import { ICommunityRepository } from './outboundPort/ICommunity.repository';

@Injectable()
export class CommunityService implements ICommunityService {
  constructor(
    @Inject(ICommunityRepository)
    private communityRepository: ICommunityRepository,
  ) {}

  async getAllcategories() {
    return this.communityRepository.getAllCategories();
  }
}
