/* tslint:disable:naming-convention */
'use strict';

import * as _ from 'lodash';
import { Transform } from 'class-transformer';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiModelProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns {(target: any, key: string) => void}
 * @constructor
 */
export function Trim() {
    return Transform((value: string | string[]) => {
        if (_.isArray(value)) {
            return value.map((v) => _.trim(v).replace(/\s\s+/g, ' '));
        }
        return _.trim(value).replace(/\s\s+/g, ' ');
    });
}
