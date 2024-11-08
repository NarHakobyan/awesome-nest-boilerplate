import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenPayloadDto } from './dto/TokenPayloadDto';

describe('AuthController', () => {
  const defaultUser = new UserEntity();

  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createAccessToken: () =>
              Promise.resolve(
                new TokenPayloadDto({ expiresIn: 3600, accessToken: 'token' }),
              ),
            validateUser: () => Promise.resolve(defaultUser),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: () => Promise.resolve(defaultUser),
          },
        },
      ],
      imports: [],
    }).compile();
  });

  describe('root', () => {
    it('should be defined', () => {
      const appController = app.get<AuthController>(AuthController);
      expect(appController).toBeDefined();
    });
  });
});
