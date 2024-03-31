import { Module } from '@nestjs/common';

import { CreatePostHandler } from './commands/create-post.command';
import { PostController } from './post.controller';
import { PostEntity } from './post.entity';
import { PostService } from './post.service';
import { PostTranslationEntity } from './post-translation.entity';
import { GetPostHandler } from './queries/get-post.query';
import { MikroOrmModule } from '@mikro-orm/nestjs';

const handlers = [CreatePostHandler, GetPostHandler];

@Module({
  imports: [MikroOrmModule.forFeature([PostEntity, PostTranslationEntity])],
  providers: [PostService, ...handlers],
  controllers: [PostController],
})
export class PostModule {}
