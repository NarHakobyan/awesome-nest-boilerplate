import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('posts')
export class PostController {
  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) {}

  @Get('search')
  call() {
    return this.client.send('search', { text: 'test' });
  }
}
