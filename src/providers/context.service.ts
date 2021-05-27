import requestContext from 'request-context';

import type { UserEntity } from '../modules/user/user.entity';

export class ContextService {
  private static readonly nameSpace = 'request';
  private static authUserKey = 'user_key';
  private static languageKey = 'language_key';

  private static get<T>(key: string): T {
    return requestContext.get(ContextService.getKeyWithNamespace(key));
  }

  private static set(key: string, value: any): void {
    requestContext.set(ContextService.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextService.nameSpace}.${key}`;
  }

  static setAuthUser(user: UserEntity): void {
    ContextService.set(ContextService.authUserKey, user);
  }

  static setLanguage(language: string): void {
    ContextService.set(ContextService.languageKey, language);
  }

  static getLanguage(): string {
    return ContextService.get(ContextService.languageKey);
  }

  static getAuthUser(): UserEntity {
    return ContextService.get(ContextService.authUserKey);
  }
}
