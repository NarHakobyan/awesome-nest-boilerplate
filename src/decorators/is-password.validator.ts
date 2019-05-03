import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// tslint:disable-next-line:naming-convention
export function IsPassword(validationOptions?: ValidationOptions): PropertyDecorator {
    return (object: any, propertyName: string) => {
        registerDecorator({
            propertyName,
            name: 'isPassword',
            target: object.constructor,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: string, _args: ValidationArguments) {
                    return /^[a-zA-Z0-9!@#$%^&*]*$/.test(value);
                },
            },
        });
    };
}
