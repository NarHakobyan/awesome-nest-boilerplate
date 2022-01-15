import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';

import type { PageDto } from '../../common/dto/page.dto';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { ValidatorService } from '../../shared/services/validator.service';
import { CreatePostCommand } from './commands/create-post.command';
import { CreatePostDto } from './dtos/create-post.dto';
import type { PostDto } from './dtos/post.dto';
import type { PostsPageOptionsDto } from './dtos/posts-page-options.dto';
import { PostNotFoundException } from './exceptions/post-not-found.exception';
import type { PostEntity } from './post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private userRepository: PostRepository,
    private validatorService: ValidatorService,
    private awsS3Service: AwsS3Service,
    private commandBus: CommandBus,
  ) {}

  @Transactional()
  createPost(userId: Uuid, createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.commandBus.execute<CreatePostCommand, PostEntity>(
      new CreatePostCommand(userId, createPostDto),
    );
  }

  async getPosts(
    pageOptionsDto: PostsPageOptionsDto,
  ): Promise<PageDto<PostDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getPost(userId: Uuid): Promise<PostDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.id = :userId', { userId });

    const userEntity = await queryBuilder.getOne();

    if (!userEntity) {
      throw new PostNotFoundException();
    }

    return userEntity.toDto();
  }
}
