import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { find } from 'lodash';

import type { CreatePostDto } from '../dtos/create-post.dto';
import type { PostEntity } from '../post.entity';
import { PostRepository } from '../post.repository';
import type { PostTranslationEntity } from '../post-translation.entity';
import { PostTranslationRepository } from '../post-translation.repository';

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
    private postRepository: PostRepository,
    private postTranslationRepository: PostTranslationRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const { userId, createPostDto } = command;
    const postEntity = this.postRepository.create({ userId });
    const translations: PostTranslationEntity[] = [];

    await this.postRepository.save(postEntity);

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

    await this.postTranslationRepository.save(translations);

    postEntity.translations = translations;

    return postEntity;
  }
}
