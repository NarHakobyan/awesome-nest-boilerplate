/* tslint:disable:naming-convention */
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

/**
 * @example
 *   @ApiModelProperty()
 *   @IsInt()
 *   startAge: number;
 *
 *   @ApiModelProperty()
 *   @IsInt()
 *   @IsGreaterThan('startAge')
 *   endAge: number;
 * @param {string} property
 * @param {ValidationOptions} validationOptions
 * @returns {PropertyDecorator}
 * @constructor
 */
export function RequiredIfNotSet(
    property: string,
    validationOptions?: ValidationOptions,
): PropertyDecorator {
    return (object: any, propertyName: string) => {
        registerDecorator({
            propertyName,
            name: 'requiredIfNotSet',
            target: object.constructor,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: number, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (<any>args.object)[
                        relatedPropertyName
                    ];
                    return !relatedValue && !value;
                },
            },
        });
    };
}
