import type { ITranslationDecoratorInterface } from '../interfaces/ITranslationDecoratorInterface.ts';

export const STATIC_TRANSLATION_DECORATOR_KEY = 'custom:static-translate';
export const DYNAMIC_TRANSLATION_DECORATOR_KEY = 'custom:dynamic-translate';

// FIXME: This is a temporary solution to get the translation decorator working.
export function StaticTranslate(
  data: ITranslationDecoratorInterface = {},
): PropertyDecorator {
  return (target, key) => {
    Reflect.defineMetadata(STATIC_TRANSLATION_DECORATOR_KEY, data, target, key);
  };
}

export function DynamicTranslate(): PropertyDecorator {
  return (target, key) => {
    Reflect.defineMetadata(DYNAMIC_TRANSLATION_DECORATOR_KEY, {}, target, key);
  };
}
