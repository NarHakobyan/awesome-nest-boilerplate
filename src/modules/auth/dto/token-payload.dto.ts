import {
  NumberField,
  StringField,
} from '../../../decorators/field.decorators.ts';

export class TokenPayloadDto {
  @NumberField()
  expiresIn: number;

  @StringField()
  token: string;

  constructor(data: { expiresIn: number; token: string }) {
    this.expiresIn = data.expiresIn;
    this.token = data.token;
  }
}
