import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';

import type { PageDto } from '../../common/dto/page.dto';
import { ValidatorService } from '../../shared/services/validator.service';
import { CreatePostCommand } from './commands/create-post.command';
import { CreatePostDto } from './dtos/create-post.dto';
import type { PostDto } from './dtos/post.dto';
import type { PostPageOptionsDto } from './dtos/post-page-options.dto';
import type { UpdatePostDto } from './dtos/update-post.dto';
import { PostNotFoundException } from './exceptions/post-not-found.exception';
import type { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private validatorService: ValidatorService,
    private commandBus: CommandBus,
  ) {}

  @Transactional()
  createPost(userId: Uuid, createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.commandBus.execute<CreatePostCommand, PostEntity>(
      new CreatePostCommand(userId, createPostDto),
    );
  }

  async getAllPost(
    postPageOptionsDto: PostPageOptionsDto,
  ): Promise<PageDto<PostDto>> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.translations', 'postTranslation');
    const [items, pageMetaDto] = await queryBuilder.paginate(
      postPageOptionsDto,
    );

    return items.toPageDto(pageMetaDto);
  }

  async getSinglePost(id: Uuid): Promise<PostEntity> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    return postEntity;
  }

  async updatePost(id: Uuid, updatePostDto: UpdatePostDto): Promise<void> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    this.postRepository.merge(postEntity, updatePostDto);

    await this.postRepository.save(updatePostDto);
  }

  async deletePost(id: Uuid): Promise<void> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    await this.postRepository.remove(postEntity);
  }
}
