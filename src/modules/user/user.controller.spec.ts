import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { TranslationService } from '../../shared/services/translation.service';
import { UsersPageOptionsDto } from './dtos/users-page-options.dto';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

describe('UserController', () => {
  let app: TestingModule;
  let underTest: UserController;
  let userService: UserService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: TranslationService, useValue: {} },
        {
          provide: UserService,
          useValue: {
            getUsers: (pageOptionsDto: UsersPageOptionsDto) =>
              Promise.resolve(
                new PageDto(
                  [new UserEntity()],
                  new PageMetaDto({ pageOptionsDto, itemCount: 1 }),
                ),
              ),
          },
        },
      ],
    }).compile();

    underTest = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
  });

  it('returns users', async () => {
    // setup
    const serviceGetUsers = jest.spyOn(userService, 'getUsers');

    // run
    const result = await underTest.getUsers(new UsersPageOptionsDto());

    // verify
    expect(result.data).toHaveLength(1);
    expect(serviceGetUsers).toHaveBeenCalledTimes(1);
  });
});
