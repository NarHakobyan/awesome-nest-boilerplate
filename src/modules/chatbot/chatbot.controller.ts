import type { MessageEvent } from '@nestjs/common';
import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Sse,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { ChatbotService } from './chatbot.service';
import { NewMessageDto } from './dtos/new-message.dto';

@Controller('messages')
@ApiTags('messages')
export class ChatbotController {
  constructor(public chatbotService: ChatbotService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: NewMessageDto,
    description: 'User info with access token',
  })
  @Header('content-type', 'text/event-stream')
  @Sse()
  userLogin(@Body() newMessageDto: NewMessageDto): Observable<MessageEvent> {
    return this.chatbotService.assistant(newMessageDto);
  }
}
