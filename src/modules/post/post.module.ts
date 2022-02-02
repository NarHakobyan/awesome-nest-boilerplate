import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePostHandler } from './commands/create-post.command';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';
import { PostTranslationRepository } from './post-translation.repository';
import { GetPostHandler } from './queries/get-post.query';

export const handlers = [CreatePostHandler, GetPostHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([PostRepository, PostTranslationRepository]),
  ],
  providers: [PostService, ...handlers],
  controllers: [PostController],
})
export class PostModule {}
