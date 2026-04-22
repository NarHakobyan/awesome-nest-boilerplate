import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export type Plain<T> = T extends Date | ((...args: never[]) => unknown)
  ? T
  : T extends Array<infer U>
    ? Array<Plain<U>>
    : T extends object
      ? {
          [K in keyof T as T[K] extends (...args: never[]) => unknown
            ? never
            : K]: Plain<T[K]>;
        }
      : T;

// biome-ignore lint/complexity/noStaticOnlyClass: base class for inheritance; subclasses inherit the static `create` factory
export abstract class BaseDto {
  static create<T extends BaseDto>(
    this: new (...args: unknown[]) => T,
    data: Plain<T>,
  ): T {
    const instance = plainToInstance<T, Plain<T>>(this, data);

    if (process.env.NODE_ENV !== 'production') {
      const errors = validateSync(instance as object);

      if (errors.length > 0) {
        throw new Error(errors.map((e) => e.toString()).join('\n'));
      }
    }

    return instance;
  }
}
