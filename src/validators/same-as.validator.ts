import type { ValidationOptions } from 'class-validator';
import { registerDecorator } from 'class-validator';

export function SameAs(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object, propertyName: string | symbol) {
    registerDecorator({
      name: 'sameAs',
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value, args) {
          const [relatedPropertyName] = args!.constraints as [string];

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          return (args!.object as any)[relatedPropertyName] === value;
        },
        defaultMessage() {
          return '$property must match $constraint1';
        },
      },
    });
  };
}
