import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntitySchema, FindConditions, ObjectType } from 'typeorm';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'unique', async: true })
export class UniqueValidator implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  public async validate<E>(value: string, args: UniqueValidationArguments<E>) {
    const [EntityClass, findCondition = args.property] = args.constraints;
    return (
      (await this.connection.getRepository(EntityClass).count({
        where:
          typeof findCondition === 'function'
            ? findCondition(args)
            : {
              [findCondition || args.property]: value,
            },
      })) <= 0
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [EntityClass] = args.constraints;
    const entity = EntityClass.name || 'Entity';
    return `${entity} with the same ${args.property} already exists`;
  }
}

type UniqueValidationConstraints<E> = [
    ObjectType<E> | EntitySchema<E> | string,
    ((validationArguments: ValidationArguments) => FindConditions<E>) | keyof E,
];
interface UniqueValidationArguments<E> extends ValidationArguments {
  constraints: UniqueValidationConstraints<E>;
}

export function Unique<E>(
  constraints: Partial<UniqueValidationConstraints<E>>,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: UniqueValidator,
    });
  };
}
