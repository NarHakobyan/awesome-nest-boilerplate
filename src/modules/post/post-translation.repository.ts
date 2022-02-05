import { EntityRepository, Repository } from 'typeorm';

import { PostTranslationEntity } from './post-translation.entity';

@EntityRepository(PostTranslationEntity)
export class PostTranslationRepository extends Repository<PostTranslationEntity> {}
