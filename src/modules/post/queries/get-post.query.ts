import type { ICommand } from '@nestjs/cqrs';

export class GetPostQuery implements ICommand {
  constructor(public readonly userId: Uuid) {}
}
