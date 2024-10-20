import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import type { TranslateOptions } from 'nestjs-i18n';
import { I18nService } from 'nestjs-i18n';

import { AbstractDto } from '../../common/dto/abstract.dto';
import { STATIC_TRANSLATION_DECORATOR_KEY } from '../../decorators';
import type { ITranslationDecoratorInterface } from '../../interfaces/ITranslationDecoratorInterface';
import { ContextProvider } from '../../providers';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}

  async translate(key: string, options?: TranslateOptions): Promise<string> {
    return this.i18n.translate(key, {
      ...options,
      lang: ContextProvider.getLanguage(),
    });
  }

  async translateNecessaryKeys<T extends AbstractDto>(dto: T): Promise<T> {
    await Promise.all(
      _.map(dto, async (value, key) => {
        if (_.isString(value)) {
          const translateDec: ITranslationDecoratorInterface | undefined =
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
        }

        if (Array.isArray(value)) {
          return Promise.all(
            _.map(value, (v: any) => {
              if (v instanceof AbstractDto) {
                return this.translateNecessaryKeys(v);
              }

              return null;
            }),
          );
        }

        return null;
      }),
    );

    return dto;
  }
}
