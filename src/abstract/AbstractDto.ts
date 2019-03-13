'use strict';

import { AbstractEntity } from './abstract.entity';

export class AbstractDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(entity?: AbstractEntity) {
        this.id = entity.id;
        this.createdAt = entity.createdAt;
        this.updatedAt = entity.updatedAt;
    }

}
