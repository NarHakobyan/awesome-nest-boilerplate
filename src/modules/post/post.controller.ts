import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../constants';
import { Auth, AuthUser, UUIDParam } from '../../decorators';
import { UseLanguageInterceptor } from '../../interceptors/language-interceptor.service';
import { UserEntity } from '../user/user.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import type { PostDto } from './dtos/post.dto';
import { PostPageOptionsDto } from './dtos/post-page-options.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('posts')
export class PostController {
  constructor(private postService: PostService) {}

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

  @Get()
  @Auth([RoleType.USER])
  @UseLanguageInterceptor()
  async getPosts(@Query() postsPageOptionsDto: PostPageOptionsDto) {
    return this.postService.getAllPost(postsPageOptionsDto);
  }

  @Get(':id')
  @Auth([])
  @HttpCode(HttpStatus.OK)
  async getSinglePost(@UUIDParam('id') id: Uuid): Promise<PostDto> {
    const entity = await this.postService.getSinglePost(id);

    return entity.toDto();
  }

  @Put(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  updatePost(
    @UUIDParam('id') id: Uuid,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    return this.postService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async deletePost(@UUIDParam('id') id: Uuid): Promise<void> {
    await this.postService.deletePost(id);
  }
}
