import { InjectDataSource } from '@nestjs/typeorm';
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';
import { registerDecorator, ValidatorConstraint } from 'class-validator';
import type { EntitySchema, FindOptionsWhere, ObjectType } from 'typeorm';
import { DataSource } from 'typeorm';

/**
 * @deprecated Don't use this validator until it's fixed in NestJS
 */
@ValidatorConstraint({ name: 'unique', async: true })
export class UniqueValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async validate<E>(
    _value: string,
    args: IUniqueValidationArguments<E>,
  ): Promise<boolean> {
    const [entityClass, findCondition] = args.constraints;

    return (
      (await this.dataSource.getRepository(entityClass).count({
        where: findCondition(args),
      })) <= 0
    );
  }

  defaultMessage(args: ValidationArguments): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [entityClass] = args.constraints;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
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
  return function (object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints,
      validator: UniqueValidator,
    });
  };
}
