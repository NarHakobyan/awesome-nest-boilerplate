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
@ValidatorConstraint({ name: 'exists', async: true })
export class ExistsValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async validate<E>(
    value: string,
    args: IExistsValidationArguments<E>,
  ): Promise<boolean> {
    const [entityClass, findCondition = args.property] = args.constraints;

    return (
      (await this.dataSource.getRepository(entityClass).count({
        where: findCondition(args),
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
  (validationArguments: ValidationArguments) => FindOptionsWhere<E>,
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
