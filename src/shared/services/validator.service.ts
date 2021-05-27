import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidatorService {
  public isImage(mimeType: string): boolean {
    const imageMimeTypes = ['image/jpeg', 'image/png'];

    return imageMimeTypes.includes(mimeType);
  }
}
