import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';

import type { CreateSettingsDto } from '../dtos/create-settings.dto';
import type { UserSettingsEntity } from '../user-settings.entity';
import { UserSettingsRepository } from '../user-settings.repository';

export class CreateSettingsCommand implements ICommand {
  constructor(
    public readonly userId: Uuid,
    public readonly createSettingsDto: CreateSettingsDto,
  ) {}
}

@CommandHandler(CreateSettingsCommand)
export class CreateSettingsHandler
  implements ICommandHandler<CreateSettingsCommand, UserSettingsEntity>
{
  constructor(private userSettingsRepository: UserSettingsRepository) {}

  async execute(command: CreateSettingsCommand) {
    const { userId, createSettingsDto } = command;
    const userSettingsEntity =
      this.userSettingsRepository.create(createSettingsDto);

    userSettingsEntity.userId = userId;

    return this.userSettingsRepository.save(userSettingsEntity);
  }
}
