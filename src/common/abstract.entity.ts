import type { Collection } from '@mikro-orm/core';
import {
  BaseEntity,
  Entity,
  Enum,
  OptionalProps,
  PrimaryKey,
  Property,
  t,
  wrap,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

import { LanguageCode } from '../constants';
import type { PostTranslationEntity } from '../modules/post/post-translation.entity';

export type BaseEntityOptional = 'createdAt' | 'updatedAt';

@Entity({ abstract: true })
export abstract class AbstractEntity<
  T extends AbstractEntity<T, any>,
  Optional extends keyof T = never,
> extends BaseEntity<T, 'id'> {
  [OptionalProps]?: BaseEntityOptional | Optional;

  @PrimaryKey({ type: t.uuid, defaultRaw: 'uuid_generate_v4()' })
  id: Uuid = v4() as Uuid;

  @Property({ defaultRaw: 'current_timestamp(3)', length: 3 })
  createdAt: Date = new Date();

  @Property({
    onUpdate: () => new Date(),
    length: 3,
    defaultRaw: 'current_timestamp(3)',
  })
  updatedAt: Date = new Date();

  translations?: Collection<PostTranslationEntity, unknown>;

  // private dtoClass: Constructor<DTO, [AbstractEntity, O?]>;
  private dtoClass?: any;

  toDto<O>(options?: O): DTO {
    const dtoClass = this.dtoClass;

    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    return new this.dtoClass(this, options);
  }
}

export class AbstractTranslationEntity<
  T extends AbstractTranslationEntity<T, any>,
  Optional extends keyof T = never,
> extends AbstractEntity<T, Optional> {
  @Enum(() => LanguageCode)
  languageCode!: LanguageCode;
}
