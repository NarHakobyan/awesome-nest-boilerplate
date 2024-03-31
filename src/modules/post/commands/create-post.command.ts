import { Collection } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { find } from 'lodash';

import type { CreatePostDto } from '../dtos/create-post.dto';
import { PostEntity } from '../post.entity';
import { PostTranslationEntity } from '../post-translation.entity';

export class CreatePostCommand implements ICommand {
  constructor(
    public readonly userId: Uuid,
    public readonly createPostDto: CreatePostDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, PostEntity>
{
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: EntityRepository<PostEntity>,
    @InjectRepository(PostTranslationEntity)
    private postTranslationRepository: EntityRepository<PostTranslationEntity>,
  ) {}

  async execute(command: CreatePostCommand) {
    const { userId, createPostDto } = command;
    const postEntity = this.postRepository.create({ userId });
    const translations: PostTranslationEntity[] = [];

    await this.postRepository.insert(postEntity);

    // FIXME: Create generic function for translation creation
    for (const createTranslationDto of createPostDto.title) {
      const languageCode = createTranslationDto.languageCode;
      const translationEntity = this.postTranslationRepository.create({
        postId: postEntity.id,
        languageCode,
        title: createTranslationDto.text,
        description: find(createPostDto.description, {
          languageCode,
        })!.text,
      });

      translations.push(translationEntity);
    }

    await this.postTranslationRepository.insertMany(translations);

    postEntity.translations = new Collection(postEntity, translations);

    return postEntity;
  }
}
