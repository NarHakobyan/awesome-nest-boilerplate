import { EntityRepository, Repository } from 'typeorm';

import type { UserEntity } from './user.entity';
import { UserSettingsEntity } from './user-settings.entity';

@EntityRepository(UserSettingsEntity)
export class UserSettingsRepository extends Repository<UserEntity> {}
