import { ClassField, StringField } from '../../../decorators/field.decorators';

export class MessageDto {
  @StringField()
  text!: string;

  @StringField()
  sender!: 'AI' | 'USER';
}

export class NewMessageDto {
  @ClassField(() => MessageDto, { each: true })
  messages!: MessageDto[];

  @StringField()
  text!: string;
}
