import { Body, Controller, Get, Inject, Optional, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { UserEntity } from '../user/user.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('posts')
export class PostController {
  constructor(
    @Optional() @Inject('NATS_SERVICE') private client: ClientProxy,
    private postService: PostService,
  ) {}

  @Post()
  @Auth([RoleType.USER])
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @AuthUser() user: UserEntity,
  ) {
    const postEntity = await this.postService.createPost(
      user.id,
      createPostDto,
    );

    return postEntity.toDto();
  }

  @Get('search')
  call() {
    return this.client.send('search', { text: 'test' });
  }
}
