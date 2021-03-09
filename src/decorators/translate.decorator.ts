import { ITranslationDecoratorInterface } from '../interfaces/translation-decorator.interface';

export const TRANSLATION_DECORATOR_KEY = 'custom:translate';

// eslint-disable-next-line @typescript-eslint/tslint/config
export function Translate(
    data: ITranslationDecoratorInterface,
): PropertyDecorator {
    return (target, key) => {
        Reflect.defineMetadata(TRANSLATION_DECORATOR_KEY, data, target, key);
    };
}
