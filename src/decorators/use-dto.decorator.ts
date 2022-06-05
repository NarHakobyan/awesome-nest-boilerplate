import type { AbstractEntity } from '../common/abstract.entity';
import type { AbstractDto } from '../common/dto/abstract.dto';
import type { Constructor } from '../types';

export function UseDto(dtoClass: any): ClassDecorator {
  return (ctor) => {
    ctor.prototype.dtoClass = dtoClass;
  };
}
