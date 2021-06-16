import type { ITranslationDecoratorInterface } from '../interfaces';

export const TRANSLATION_DECORATOR_KEY = 'custom:translate';

export function Translate(
  data: ITranslationDecoratorInterface,
): PropertyDecorator {
  return (target, key) => {
    Reflect.defineMetadata(TRANSLATION_DECORATOR_KEY, data, target, key);
  };
}
