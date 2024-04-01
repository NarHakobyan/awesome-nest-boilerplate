import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { AbstractTranslationEntity } from '../../common/abstract.entity';
import { PostTranslationDto } from './dtos/post-translation.dto';
import { PostEntity } from './post.entity';

@Entity({ tableName: 'post_translations' })
export class PostTranslationEntity extends AbstractTranslationEntity<PostTranslationDto> {
  dtoClass = () => PostTranslationDto as any;

  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property({ type: 'uuid', fieldName: 'post_id', persist: false })
  postId!: string; // Ensure this is your foreign key column, linked via the ManyToOne relation below

  @ManyToOne({
    entity: () => PostEntity, // This tells MikroORM the entity to use for the relation
    fieldName: 'post_id', // This tells MikroORM the column name to use, which should match the one defined in @Property above
    joinColumn: 'post_id', // Explicitly define the join column name for clarity, though this is optional if fieldName is already specified
    columnType: 'uuid', // This specifies the column type, ensuring it matches the type defined in @Property
    deleteRule: 'cascade', // Use onDelete instead of deleteRule
    updateRule: 'cascade', // Use onUpdate instead of updateRule
  })
  post?: PostEntity; // This does not directly create a new column but links to the existing 'post_id' column
}
