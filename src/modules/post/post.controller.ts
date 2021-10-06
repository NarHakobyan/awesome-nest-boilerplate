import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('posts')
export class PostController {
  constructor(
    @Optional() @Inject('NATS_SERVICE') private client: ClientProxy,
  ) {}

  @Get('search')
  call() {
    return this.client.send('search', { text: 'test' });
  }
}
