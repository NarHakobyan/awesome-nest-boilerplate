export type Constructor<T, Arguments extends unknown[] = any[]> = new (
  ...arguments_: Arguments
) => T;

export type Plain<T> = T;
