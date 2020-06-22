'use strict';

import { BadRequestException } from '@nestjs/common';

export class FileNotImageException extends BadRequestException {
    constructor(message?: string | any, error?: string) {
        if (message) {
            super(message, error);
        } else {
            super('error.file.not_image');
        }
    }
}
