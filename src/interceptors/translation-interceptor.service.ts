import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { TranslationService } from '../shared/services/translation.service';
import type { AbstractDto } from '../common/dto/abstract.dto';

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}
  public intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<AbstractDto> {
    return next
      .handle()
      .pipe(
        mergeMap((data) =>
          this.translationService.translateNecessaryKeys<AbstractDto>(data),
        ),
      );
  }
}
