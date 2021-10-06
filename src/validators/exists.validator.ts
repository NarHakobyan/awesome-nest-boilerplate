import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';
import { registerDecorator, ValidatorConstraint } from 'class-validator';
import type { EntitySchema, FindConditions, ObjectType } from 'typeorm';
import { Connection } from 'typeorm';

@Injectable()
@ValidatorConstraint({ name: 'exists', async: true })
export class ExistsValidator implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  public async validate<E>(
    value: string,
    args: IExistsValidationArguments<E>,
  ): Promise<boolean> {
    const [entityClass, findCondition = args.property] = args.constraints;

    return (
      (await this.connection.getRepository(entityClass).count({
        where:
          typeof findCondition === 'function'
            ? findCondition(args)
            : {
                [findCondition || args.property]: value,
              },
      })) > 0
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass] = args.constraints;
    const entity = entityClass.name || 'Entity';

    return `The selected ${args.property}  does not exist in ${entity} entity`;
  }
}

type ExistsValidationConstraints<E> = [
  ObjectType<E> | EntitySchema<E> | string,
  ((validationArguments: ValidationArguments) => FindConditions<E>) | keyof E,
];
interface IExistsValidationArguments<E> extends ValidationArguments {
  constraints: ExistsValidationConstraints<E>;
}

export function Exists<E>(
  constraints: Partial<ExistsValidationConstraints<E>>,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints,
      validator: ExistsValidator,
    });
  };
}
