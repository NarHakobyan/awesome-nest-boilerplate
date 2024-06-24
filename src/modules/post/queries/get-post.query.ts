import type { ICommand, IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity } from '../post.entity';

export class GetPostQuery implements ICommand {
  constructor(public readonly userId: Uuid) {}
}

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  async execute(query: GetPostQuery) {
    return this.postRepository.findBy({
      userId: query.userId as never,
    });
  }
}
