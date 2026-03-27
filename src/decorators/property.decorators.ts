import type { ApiPropertyOptions } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

import { getVariableName } from '../common/utils.ts';

export function ApiBooleanProperty(
  options: Omit<ApiPropertyOptions, 'type'> = {},
): PropertyDecorator {
  return ApiProperty({ type: Boolean, ...(options as ApiPropertyOptions) });
}

export function ApiBooleanPropertyOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> = {},
): PropertyDecorator {
  return ApiBooleanProperty({ required: false, ...options });
}

export function ApiUUIDProperty(
  options: Omit<ApiPropertyOptions, 'type' | 'format'> &
    Partial<{ each: boolean }> = {},
): PropertyDecorator {
  return ApiProperty({
    type: options.each ? [String] : String,
    format: 'uuid',
    isArray: options.each,
    ...(options as ApiPropertyOptions),
  });
}

export function ApiUUIDPropertyOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'required'> &
    Partial<{ each: boolean }> = {},
): PropertyDecorator {
  return ApiUUIDProperty({ required: false, ...options });
}

export function ApiEnumProperty(
  getEnum: () => unknown,
  options: Omit<ApiPropertyOptions, 'type'> & { each?: boolean } = {},
): PropertyDecorator {
  const enumValue = getEnum();

  return ApiProperty({
    /* isArray: options.each, — throws error during swagger compilation */
    enum: enumValue as object,
    enumName: getVariableName(getEnum),
    ...(options as ApiPropertyOptions),
  });
}

export function ApiEnumPropertyOptional(
  getEnum: () => unknown,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & {
    each?: boolean;
  } = {},
): PropertyDecorator {
  return ApiEnumProperty(getEnum, { required: false, ...options });
}
