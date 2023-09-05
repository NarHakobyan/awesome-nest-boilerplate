import { Test, type TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { UserEntity } from '../user/user.entity';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let app: TestingModule;

beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            createAccessToken: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
      imports: [],
    }).compile();
  });

describe('userLogin', () => {
    it('should return LoginPayloadDto', async () => {
      const appController = app.get<AuthController>(AuthController);
      const mockUserLoginDto = new UserLoginDto();
      const mockLoginPayloadDto = { user: {}, token: 'mockToken' };
describe('userRegister', () => {
    it('should return UserDto', async () => {
      const appController = app.get<AuthController>(AuthController);
      const mockUserRegisterDto = new UserRegisterDto();
      const mockFile = {};
      const mockUserDto = { user: {} };
describe('getCurrentUser', () => {
    it('should return UserDto', () => {
      const appController = app.get<AuthController>(AuthController);
      const mockUserEntity = new UserEntity();
      const mockUserDto = { user: {} };

      jest.spyOn(appController, 'getCurrentUser').mockImplementation(() => mockUserDto);

      expect(appController.getCurrentUser(mockUserEntity)).toBe(mockUserDto);
    });
  });
    it('should throw error when UserService throws error', async () => {
      const appController = app.get<AuthController>(AuthController);
      const mockUserRegisterDto = new UserRegisterDto();
      const mockFile = {};

      jest.spyOn(appController, 'userRegister').mockImplementation(async () => { throw new Error(); });

      await expect(appController.userRegister(mockUserRegisterDto, mockFile)).rejects.toThrow(Error);
    });
  });