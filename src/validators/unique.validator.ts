import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';
import { registerDecorator } from 'class-validator';
import type { EntitySchema, FindOptionsWhere, ObjectType } from 'typeorm';
import { getRepository } from 'typeorm';

/**
 * @deprecated Don't use this validator until it's fixed in NestJS
 */
export class UniqueValidator implements ValidatorConstraintInterface {
  public async validate<E>(
    value: string,
    args: IUniqueValidationArguments<E>,
  ): Promise<boolean> {
    const [entityClass, findCondition = args.property] = args.constraints;

    return (
      (await getRepository(entityClass).count({
        where: findCondition(args),
      })) <= 0
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass] = args.constraints;
    const entity = entityClass.name || 'Entity';

    return `${entity} with the same ${args.property} already exists`;
  }
}

type UniqueValidationConstraints<E> = [
  ObjectType<E> | EntitySchema<E> | string,
  (validationArguments: ValidationArguments) => FindOptionsWhere<E>,
];
interface IUniqueValidationArguments<E> extends ValidationArguments {
  constraints: UniqueValidationConstraints<E>;
}

export function Unique<E>(
  constraints: Partial<UniqueValidationConstraints<E>>,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints,
      validator: UniqueValidator,
    });
  };
}
