import type { NamingStrategyInterface } from 'typeorm';
import { DefaultNamingStrategy } from 'typeorm';

function snakeCase(str: string): string {
  return (
    str
      // ABc -> a_bc
      .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      // aC -> a_c
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
  );
}

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  override tableName(
    className: string,
    customName: string | undefined,
  ): string {
    return customName ?? snakeCase(className);
  }

  override columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return (
      snakeCase(embeddedPrefixes.join('_')) +
      (customName ?? snakeCase(propertyName))
    );
  }

  override relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  override joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return snakeCase(relationName + '_' + referencedColumnName);
  }

  override joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
    _secondPropertyName: string,
  ): string {
    return snakeCase(
      firstTableName +
        '_' +
        firstPropertyName.replaceAll(/\./gi, '_') +
        '_' +
        secondTableName,
    );
  }

  override joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(tableName + '_' + (columnName ?? propertyName));
  }

  classTableInheritanceParentColumnName(
    parentTableName: string,
    parentTableIdPropertyName: string,
  ): string {
    return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
  }
}
