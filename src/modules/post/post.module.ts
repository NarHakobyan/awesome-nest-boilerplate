import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { CreatePostHandler } from './commands/create-post.command';
import { PostController } from './post.controller';
import { PostRepository } from './post.entity';
import { PostService } from './post.service';
import { PostTranslationRepository } from './post-translation.entity';
import { GetPostHandler } from './queries/get-post.query';

export const handlers = [CreatePostHandler, GetPostHandler];

@Module({
  imports: [
    MikroOrmModule.forFeature([PostRepository, PostTranslationRepository]),
  ],
  providers: [PostService, ...handlers],
  controllers: [PostController],
})
export class PostModule {}
