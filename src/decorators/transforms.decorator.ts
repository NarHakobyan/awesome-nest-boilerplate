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
export const Trim = () =>
    Transform((value: string | string[]) => {
        if (_.isArray(value)) {
            return value.map(v => _.trim(v).replace(/\s\s+/g, ' '));
        }
        return _.trim(value).replace(/\s\s+/g, ' ');
    });

/**
 * @description convert string or number to integer
 * @example
 * @IsNumber()
 * @ToInt()
 * name: number;
 * @returns {(target: any, key: string) => void}
 * @constructor
 */
export const ToInt = () =>
    Transform(value => parseInt(value, 10), { toClassOnly: true });
