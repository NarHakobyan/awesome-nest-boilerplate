'use strict';

import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {

    constructor(error?: string) {
        super('error.user_not_found', error);
    }
}
