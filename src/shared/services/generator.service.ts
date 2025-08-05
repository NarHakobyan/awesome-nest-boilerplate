import { Injectable } from '@nestjs/common';
import { v1 as uuid } from 'uuid';

@Injectable()
export class GeneratorService {
  public static uuid(): string {
    return uuid();
  }

  public static fileName(ext: string): string {
    return `${GeneratorService.uuid()}.${ext}`;
  }
}
