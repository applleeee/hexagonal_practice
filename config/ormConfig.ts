import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Comment } from 'entity/Comment';
import { CommentLike } from 'entity/CommentLike';
import { MainCategory } from 'entity/MainCategory';
import { Post } from 'entity/Post';
import { PostLike } from 'entity/PostLike';
import { SubCategory } from 'entity/SubCategory';
import { User } from 'entity/User';
dotenv.config();

const config: TypeOrmModuleOptions = {
  type: 'mysql',
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  host: process.env.DB_HOST_LOCAL,
  password: process.env.DB_PASSWORD_LOCAL,
  database: process.env.DB_DATABASE_LOCAL,
  synchronize: true,
  logging: false,
  charset: 'utf8mb4',
  extra: {
    charset: 'utf8mb4_general_ci',
  },
  entities: [
    Comment,
    CommentLike,
    MainCategory,
    Post,
    PostLike,
    SubCategory,
    User,
  ],
};

export = config;
