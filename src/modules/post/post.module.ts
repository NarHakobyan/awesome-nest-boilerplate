import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePostHandler } from './commands/create-post.command.ts';
import { PostController } from './post.controller.ts';
import { PostEntity } from './post.entity.ts';
import { PostService } from './post.service.ts';
import { PostTranslationEntity } from './post-translation.entity.ts';
import { GetPostHandler } from './queries/get-post.query.ts';

const handlers = [CreatePostHandler, GetPostHandler];

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostTranslationEntity])],
  providers: [PostService, ...handlers],
  controllers: [PostController],
})
export class PostModule {}
