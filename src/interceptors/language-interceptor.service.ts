import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable, UseInterceptors } from '@nestjs/common';

import { LanguageCode } from '../constants';
import { ContextProvider } from '../providers';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const language: LanguageCode = request.headers['x-language-code'];

    if (LanguageCode[language]) {
      ContextProvider.setLanguage(language);
    }

    return next.handle();
  }
}

export function UseLanguageInterceptor() {
  return UseInterceptors(LanguageInterceptor);
}
