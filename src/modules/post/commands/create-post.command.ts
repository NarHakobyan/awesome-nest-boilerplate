import type { ICommand } from '@nestjs/cqrs';

import type { CreatePostDto } from '../dtos/create-post.dto.ts';

export class CreatePostCommand implements ICommand {
  constructor(
    public readonly userId: Uuid,
    public readonly createPostDto: CreatePostDto,
  ) {}
}
