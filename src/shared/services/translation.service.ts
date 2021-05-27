import { Injectable } from '@nestjs/common';
import { isArray, isString, map } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import type { translateOptions } from 'nestjs-i18n/dist/services/i18n.service';

import { AbstractDto } from '../../common/dto/abstract.dto';
import { TRANSLATION_DECORATOR_KEY } from '../../decorators/translate.decorator';
import type { ITranslationDecoratorInterface } from '../../interfaces/ITranslationDecoratorInterface';
import { ContextService } from '../../providers/context.service';

@Injectable()
export class TranslationService {
  constructor(private readonly i18n: I18nService) {}
  async translate(
    key: string,
    options: translateOptions = {},
  ): Promise<string> {
    return this.i18n.translate(`translations.${key}`, options);
  }

  async translateNecessaryKeys<T extends AbstractDto>(dto: T): Promise<T> {
    await Promise.all(
      map(dto, async (value, key) => {
        if (isString(value)) {
          const translateDec: ITranslationDecoratorInterface = Reflect.getMetadata(
            TRANSLATION_DECORATOR_KEY,
            dto,
            key,
          );
          if (translateDec.translationKey) {
            await this.translate(`${translateDec.translationKey}.${value}`, {
              lang: ContextService.getLanguage(),
            });
          }
          return;
        }

        if (value instanceof AbstractDto) {
          await this.translateNecessaryKeys(value);
          return;
        }
        if (isArray(value)) {
          await Promise.all(
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
