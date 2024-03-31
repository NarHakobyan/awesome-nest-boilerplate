import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@nestjs/cqrs';

import { type CreateSettingsDto } from '../dtos/create-settings.dto';
import { UserSettingsEntity } from '../user-settings.entity';

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
  constructor(
    @InjectRepository(UserSettingsEntity)
    private userSettingsRepository: EntityRepository<UserSettingsEntity>,
  ) {}

  async execute(command: CreateSettingsCommand) {
    const { userId, createSettingsDto } = command;
    const userSettingsEntity =
      this.userSettingsRepository.create(createSettingsDto);

    userSettingsEntity.userId = userId;

    await this.userSettingsRepository.insert(userSettingsEntity);

    return userSettingsEntity;
  }
}
