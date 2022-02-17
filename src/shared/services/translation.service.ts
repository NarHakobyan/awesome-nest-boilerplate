import { Injectable } from '@nestjs/common';
import { isArray, isString, map } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import type { translateOptions } from 'nestjs-i18n/dist/services/i18n.service';

import { AbstractDto } from '../../common/dto/abstract.dto';
import { STATIC_TRANSLATION_DECORATOR_KEY } from '../../decorators';
import type { ITranslationDecoratorInterface } from '../../interfaces';
import { ContextProvider } from '../../providers';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  async translate(key: string, options?: translateOptions): Promise<string> {
    return this.i18n.translate(`${key}`, {
      ...options,
      lang: ContextProvider.getLanguage(),
    });
  }

  async translateNecessaryKeys<T extends AbstractDto>(dto: T): Promise<T> {
    await Promise.all(
      map(dto, async (value, key) => {
        if (isString(value)) {
          const translateDec: ITranslationDecoratorInterface =
            Reflect.getMetadata(STATIC_TRANSLATION_DECORATOR_KEY, dto, key);

          if (translateDec) {
            return this.translate(
              `${translateDec.translationKey ?? key}.${value}`,
            );
          }

          return;
        }

        if (value instanceof AbstractDto) {
          return this.translateNecessaryKeys(value);

          return;
        }

        if (isArray(value)) {
          return Promise.all(
            map(value, (v) => {
              if (v instanceof AbstractDto) {
                return this.translateNecessaryKeys(v);
              }
            }),
          );
        }
      }),
    );

    return dto;
  }
}
