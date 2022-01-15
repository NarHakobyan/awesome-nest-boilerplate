import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { LanguageCode } from '../constants';
import { ContextProvider } from '../providers';

@Injectable()
export class LanguageCodeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<undefined> {
    const request = context.switchToHttp().getRequest();
    const languageCode: LanguageCode =
      request.headers['x-language-code']?.toUpperCase();

    if (LanguageCode[languageCode]) {
      ContextProvider.setLanguage(languageCode);
    }

    return next.handle();
  }
}
