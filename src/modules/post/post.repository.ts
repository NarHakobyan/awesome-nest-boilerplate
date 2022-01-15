import { EntityRepository, Repository } from 'typeorm';

import { PostEntity } from './post.entity';

@EntityRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {}
