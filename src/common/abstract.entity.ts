import type { Collection } from '@mikro-orm/core';
import { Enum, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

import { LanguageCode } from '../constants';
import type { Constructor } from '../types';
import type { AbstractDto, AbstractTranslationDto } from './dto/abstract.dto';

/**
 * Abstract Entity
 * @author Narek Hakobyan <narek.hakobyan.07@gmail.com>
 *
 * @description This class is an abstract class for all entities.
 * It's experimental and recommended using it only in microservice architecture,
 * otherwise just delete and use your own entity.
 */
export abstract class AbstractEntity<
  DTO extends AbstractDto = AbstractDto,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Optional = any,
> {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
  id!: Uuid;

  @Property({ type: 'timestamp', defaultRaw: 'now()' })
  createdAt = new Date();

  @Property({ type: 'timestamp', defaultRaw: 'now()', onUpdate: () => new Date() })
  updatedAt = new Date();

  translations?: Collection<AbstractTranslationEntity>;

  private dtoClass?: Constructor<DTO, [AbstractEntity, O?, Optional?]>;

  toDto(options?: O): DTO {
    const dtoClass = this.dtoClass;

    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    return new dtoClass(this, options);
  }
}

export class AbstractTranslationEntity<
  DTO extends AbstractTranslationDto = AbstractTranslationDto,
  O = never,
> extends AbstractEntity<DTO, O> {
  @Enum(() => LanguageCode)
  languageCode!: LanguageCode;
}
