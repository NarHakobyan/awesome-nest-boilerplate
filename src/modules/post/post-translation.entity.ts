import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { AbstractTranslationEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { PostTranslationDto } from './dtos/post-translation.dto';
import { PostEntity } from './post.entity';

@Entity({ tableName: 'post_translations' })
@UseDto(() => PostTranslationDto)
export class PostTranslationEntity extends AbstractTranslationEntity<PostTranslationDto> {
  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property({ type: 'uuid', persist: false })
  postId!: string; // Ensure this is your foreign key column, linked via the ManyToOne relation below

  @ManyToOne({
    entity: () => PostEntity, // This tells MikroORM the entity to use for the relation
    joinColumn: 'post_id', // Explicitly define the join column name for clarity, though this is optional if fieldName is already specified
    columnType: 'uuid', // This specifies the column type, ensuring it matches the type defined in @Property
    deleteRule: 'cascade', // Use onDelete instead of deleteRule
    updateRule: 'cascade', // Use onUpdate instead of updateRule
    nullable: false,
  })
  post?: PostEntity; // This does not directly create a new column but links to the existing 'post_id' column
}
