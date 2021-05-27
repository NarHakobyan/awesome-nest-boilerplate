import type { ITranslationDecoratorInterface } from '../interfaces/ITranslationDecoratorInterface';

export const TRANSLATION_DECORATOR_KEY = 'custom:translate';

// eslint-disable-next-line @typescript-eslint/tslint/config
export function Translate(
  data: ITranslationDecoratorInterface,
): PropertyDecorator {
  return (target, key) => {
    Reflect.defineMetadata(TRANSLATION_DECORATOR_KEY, data, target, key);
  };
}
