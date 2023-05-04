import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from 'entity/SubCategory';
import { ICommunityRepository } from 'src/community/domain/outboundPort/ICommunity.repository';
import { Repository } from 'typeorm';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(
    @InjectRepository(SubCategory)
    private subCategoryRepository: Repository<SubCategory>,
  ) {}

  async getAllCategories() {
    return await this.subCategoryRepository.find();
  }
}
