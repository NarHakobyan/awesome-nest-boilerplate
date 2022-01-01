import { EntityRepository, Repository } from 'typeorm';

import { UserSettingsEntity } from './user-settings.entity';

@EntityRepository(UserSettingsEntity)
export class UserSettingsRepository extends Repository<UserSettingsEntity> {}
