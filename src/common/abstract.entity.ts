import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UtilsProvider } from '../providers/utils.provider';
import type { AbstractDto } from './dto/abstract.dto';

type GetConstructorArgs<T> = T extends new (...args: infer U) => any
  ? U
  : never;

export abstract class AbstractEntity<DTO extends AbstractDto = AbstractDto> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  abstract dtoClass: new (entity: AbstractEntity, options?: any) => DTO;

  toDto<T>(options?: GetConstructorArgs<T>[1]): DTO {
    return UtilsProvider.toDto(this.dtoClass, this, options);
  }
}
