import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePostHandler } from './commands/create-post.command';
import { PostController } from './post.controller';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';
import { PostTranslationRepository } from './post-translation.repository';

export const handlers = [CreatePostHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([PostRepository, PostTranslationRepository]),
  ],
  providers: [PostService, ...handlers],
  controllers: [PostController],
})
export class PostModule {}
