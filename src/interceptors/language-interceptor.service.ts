import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';

import { LanguageCode } from '../constants/language-code.ts';
import { ContextProvider } from '../providers/context.provider.ts';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const language: LanguageCode = request.headers[
      'x-language-code'
    ] as LanguageCode;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (LanguageCode[language]) {
      ContextProvider.setLanguage(language);
    }

    return next.handle();
  }
}

export function UseLanguageInterceptor() {
  return UseInterceptors(LanguageInterceptor);
}
