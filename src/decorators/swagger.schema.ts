import { ApiBody } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ApiFile = (
    fileName = 'file',
    options: Partial<{ isRequired: boolean; isArray: boolean }> = {},
): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    const { isRequired = false, isArray = false } = options;
    let fileSchema: SchemaObject = {
        type: 'string',
        format: 'binary',
    };

    if (isArray) {
        fileSchema = {
            type: 'array',
            items: fileSchema,
        };
    }
    ApiBody({
        required: isRequired,
        type: 'multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                [fileName]: fileSchema,
            },
        },
    })(target, propertyKey, descriptor);
};
