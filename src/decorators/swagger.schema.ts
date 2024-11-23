// eslint-disable-next-line max-len
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument */
import type { Type } from '@nestjs/common';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import _ from 'lodash';

import type { IApiFile } from '../interfaces/IApiFile.ts';

const PARAMTYPES_METADATA = 'design:paramtypes';

function reverseObjectKeys(
  originalObject: Record<string, any>,
): Record<string, any> {
  const reversedObject: any = {};
  const keys = Object.keys(originalObject).reverse();

  for (const key of keys) {
    reversedObject[key] = originalObject[key];
  }

  return reversedObject;
}

const ROUTE_ARGS_METADATA = '__routeArguments__';

function explore(instance: object, propertyKey: string | symbol) {
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

  const parametersWithType = _.mapValues(
    reverseObjectKeys(routeArgsMetadata),
    (param) => ({
      type: types[param.index],
      name: param.data,
      required: true,
    }),
  );

  for (const [key, value] of Object.entries(parametersWithType)) {
    const keyPair = key.split(':');

    if (Number(keyPair[0]) === 3) {
      return value.type;
    }
  }

  return null;
}

function RegisterModels(): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const body = explore(target, propertyKey);

    return body && ApiExtraModels(body)(target, propertyKey, descriptor);
  };
}

function ApiFileDecorator(
  files: IApiFile[] = [],
  options: Partial<{ isRequired: boolean }> = {},
): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const { isRequired = false } = options;
    const fileSchema: SchemaObject = {
      type: 'string',
      format: 'binary',
    };
    const properties: Record<string, SchemaObject | ReferenceObject> = {};

    for (const file of files) {
      properties[file.name] = file.isArray
        ? {
            type: 'array',
            items: fileSchema,
          }
        : fileSchema;
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
}

export function ApiFile(
  files: _.Many<IApiFile>,
  options: Partial<{ isRequired: boolean }> = {},
): MethodDecorator {
  const filesArray = _.castArray(files);
  const apiFileInterceptors = filesArray.map((file) =>
    file.isArray
      ? UseInterceptors(FilesInterceptor(file.name))
      : UseInterceptors(FileInterceptor(file.name)),
  );

  return applyDecorators(
    RegisterModels(),
    ApiConsumes('multipart/form-data'),
    ApiFileDecorator(filesArray, options),
    ...apiFileInterceptors,
  );
}
