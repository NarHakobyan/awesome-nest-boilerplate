import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity } from '../post.entity.ts';
import { PostTranslationEntity } from '../post-translation.entity.ts';
import { CreatePostCommand } from './create-post.command.ts';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, PostEntity>
{
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(PostTranslationEntity)
    private postTranslationRepository: Repository<PostTranslationEntity>,
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
        description: createPostDto.description.find(
          (desc) => desc.languageCode === languageCode,
        )!.text,
      });

      translations.push(translationEntity);
    }

    await this.postTranslationRepository.save(translations);

    postEntity.translations = translations;

    return postEntity;
  }
}
