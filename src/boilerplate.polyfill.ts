import 'source-map-support/register';

import * as _ from 'lodash';

import { AbstractEntity } from './common/abstract.entity';
import { AbstractDto } from './common/dto/AbstractDto';

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/tslint/config
    interface Array<T> {
        toDtos<B extends AbstractDto>(this: AbstractEntity<B>[]): B[];
    }
}

Array.prototype.toDtos = function <B extends AbstractDto>(options?: any): B[] {
    // tslint:disable-next-line:no-invalid-this
    return <B[]>_(this)
        .map((item) => item.toDto(options))
        .compact()
        .value();
};
