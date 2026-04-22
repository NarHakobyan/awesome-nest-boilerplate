import { BaseDto } from '../../../common/dto/base.dto.ts';
import {
  NumberField,
  StringField,
} from '../../../decorators/field.decorators.ts';

export class TokenPayloadDto extends BaseDto {
  @NumberField()
  expiresIn!: number;

  @StringField()
  token!: string;
}
