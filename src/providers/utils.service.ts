import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

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

    /**
     * generate hash from password or string
     * @param {string} password
     * @returns {Promise<string>}
     */
    generateHash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * validate text with hash
     * @param {string} password
     * @param {string} hash
     * @returns {Promise<boolean>}
     */
    validateHash(password: string, hash: string = ''): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
