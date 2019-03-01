import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    /**
     * convert entity to dto class instance
     * @param {{new(entity: E): T}} model
     * @param {E[] | E} user
     * @returns {T[] | T}
     */
    public toDto<T, E>(model: new (entity: E) => T, user: E): T;
    public toDto<T, E>(model: new (entity: E) => T, user: E[]): T[];
    public toDto<T, E>(model: new (entity: E) => T, user: E | E[]): T | T[] {
        if (_.isArray(user)) {
            return user.map((u) => new model(u));
        }

        return new model(user);
    }
}
