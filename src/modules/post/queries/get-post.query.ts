import type { ICommand, IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';

import { PostRepository } from '../post.repository';

export class GetPostQuery implements ICommand {
  constructor(public readonly userId: Uuid) {}
}

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(private postRepository: PostRepository) {}

  async execute(query: GetPostQuery) {
    return this.postRepository.findBy({
      userId: query.userId as never,
    });
  }
}
