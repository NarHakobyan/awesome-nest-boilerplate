/* eslint-disable @typescript-eslint/naming-convention */
import type { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import {
    PARAMTYPES_METADATA,
    ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { reverseObjectKeys } from '@nestjs/swagger/dist/utils/reverse-object-keys.util';
import { mapValues } from 'lodash';

import type { IApiFile } from '../interfaces/IApiFile';

function explore(instance: any, propertyKey: string) {
    const types: Array<Type<unknown>> = Reflect.getMetadata(
        PARAMTYPES_METADATA,
        instance,
        propertyKey,
    );
    const routeArgsMetadata =
        Reflect.getMetadata(
            ROUTE_ARGS_METADATA,
            instance.constructor,
            propertyKey,
        ) || {};

    const parametersWithType = mapValues(
        reverseObjectKeys(routeArgsMetadata),
        (param) => ({
            type: types[param.index],
            name: param.data,
            required: true,
        }),
    );

    for (const [key, value] of Object.entries(parametersWithType)) {
        const keyPair = key.split(':');

        if (Number(keyPair[0]) === RouteParamtypes.BODY) {
            return (<any>value).type;
        }
    }
}

const RegisterModels = (): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    const body = explore(target, propertyKey);
    return body && ApiExtraModels(body)(target, propertyKey, descriptor);
};

const ApiFileDecorator = (
    files: IApiFile[] = [],
    options: Partial<{ isRequired: boolean }> = {},
): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    const { isRequired = false } = options;
    const fileSchema: SchemaObject = {
        type: 'string',
        format: 'binary',
    };
    let properties = {};
    if (files) {
        properties = files.reduce((filesMap, file) => {
            if (file?.isArray) {
                filesMap[file.name] = {
                    type: 'array',
                    items: fileSchema,
                };
            } else {
                filesMap[file.name] = fileSchema;
            }
            return filesMap;
        }, {});
    }

    let schema: SchemaObject = {
        properties,
        type: 'object',
    };
    const body = explore(target, propertyKey);

    if (body) {
        schema = {
            allOf: [
                {
                    $ref: getSchemaPath(body),
                },
                { properties, type: 'object' },
            ],
        };
    }

    return ApiBody({
        schema,
        required: isRequired,
    })(target, propertyKey, descriptor);
};

export const ApiFile = (
    files: IApiFile[] = [],
    options: Partial<{ isRequired: boolean }> = {},
) => applyDecorators(RegisterModels(), ApiFileDecorator(files, options));
