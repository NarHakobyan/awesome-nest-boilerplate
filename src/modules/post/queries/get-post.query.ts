import type { ICommand, IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';

import { PostRepository } from '../post.entity';

export class GetPostQuery implements ICommand {
  constructor(public readonly userId: Uuid) {}
}

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(private postRepository: PostRepository) {}

  execute(query: GetPostQuery) {
    return this.postRepository.findOne({
      userId: query.userId as never,
    });
  }
}
