import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'entity/Comment';
import { CommentLike } from 'entity/CommentLike';
import { MainCategory } from 'entity/MainCategory';
import { Post } from 'entity/Post';
import { PostLike } from 'entity/PostLike';
import { SubCategory } from 'entity/SubCategory';
import { User } from 'entity/User';
import { CommunityController } from './adapter/in/community.controller';
import { ICommunityService } from './domain/inboundPort/ICommunity.service';
import { CommunityService } from './domain/community.service';
import { ICommunityRepository } from './domain/outboundPort/ICommunity.repository';
import { CommunityRepository } from './adapter/out/community.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      MainCategory,
      SubCategory,
      Post,
      PostLike,
      Comment,
      CommentLike,
    ]),
  ],
  controllers: [CommunityController],
  providers: [
    {
      provide: ICommunityService,
      useClass: CommunityService,
    },
    {
      provide: ICommunityRepository,
      useClass: CommunityRepository,
    },
  ],
})
export class CommunityModule {}
