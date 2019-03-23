'use strict';

import * as _ from 'lodash';
import { AbstractDto } from './abstract/AbstractDto';
import { AbstractEntity } from './abstract/abstract.entity';

declare global {
// tslint:disable-next-line:naming-convention no-unused
    interface Array<T> {
        toDtos(this: AbstractEntity[]): AbstractDto[];
    }
}

Array.prototype.toDtos = function(): AbstractDto[] {
    // tslint:disable-next-line:no-invalid-this
    return _(this).map((item) => item.toDto()).compact().value();
};
