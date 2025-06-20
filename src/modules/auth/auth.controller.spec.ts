import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { jest } from '@jest/globals';

import { AuthController } from './auth.controller.ts';

import { AuthService } from './auth.service.ts';
import { UserService } from '../user/user.service.ts';
import { UserLoginDto } from './dto/user-login.dto.ts';
import { LoginPayloadDto } from './dto/login-payload.dto.ts';
import { UserEntity } from '../user/user.entity.ts';
import { RoleType } from '../../constants/role-type.ts';
import { UserDto } from '../user/dtos/user.dto.ts';
import { UserRegisterDto } from './dto/user-register.dto.ts';
import type { IFile } from '../../interfaces/IFile.ts';

// Mock for AuthService
const mockAuthService = {
  validateUser: jest.fn(),
  createAccessToken: jest.fn(),
};

// Mock for UserService
const mockUserService = {
  createUser: jest.fn(),
};

describe('AuthController', () => {
  let app: TestingModule;
  let authController: AuthController;

  // Reset mocks before each test
  beforeEach(() => {
    mockAuthService.validateUser.mockReset();
    mockAuthService.createAccessToken.mockReset();
    mockUserService.createUser.mockReset(); // Now resetting this as well
  });

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
      imports: [],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  // describe('root', () => {
  //   it('should return "http://localhost"', () => {
  //     const appController = app.get<AuthController>(AuthController);
  //     expect(appController).toBe('http://localhost');
  //   });
  // });

  describe('userLogin', () => {
    it('should return LoginPayloadDto on successful login', async () => {
      const mockUserLoginDto = {
        email: 'test@example.com',
        password: 'password',
      } as UserLoginDto;

      // This is the plain object we expect userEntity.toDto() to return
      const mockUserDtoOutput = {
        id: 'mock-user-id',
        role: RoleType.USER,
        email: 'test@example.com',
        // Add other fields that UserDto might have if they are relevant for assertions
        // For example: firstName: 'Test', lastName: 'User'
      };

      const mockUserEntity = {
        id: 'mock-user-id',
        role: RoleType.USER,
        toDto: jest.fn().mockReturnValue(mockUserDtoOutput), // Mock toDto to return the plain object
      } as unknown as UserEntity; // Type assertion for mock

      const mockToken = {
        accessToken: 'mock-access-token',
        expiresIn: 3600,
      };

      mockAuthService.validateUser.mockResolvedValueOnce(mockUserEntity);
      mockAuthService.createAccessToken.mockResolvedValueOnce(mockToken);

      const result = await authController.userLogin(mockUserLoginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockUserLoginDto,
      );
      expect(mockAuthService.createAccessToken).toHaveBeenCalledWith({
        userId: mockUserEntity.id,
        role: mockUserEntity.role,
      });
      expect(mockUserEntity.toDto).toHaveBeenCalled();
      expect(result).toBeInstanceOf(LoginPayloadDto);
      expect(result.user).toEqual(mockUserDtoOutput); // Assert against the plain object
      expect(result.accessToken).toEqual(mockToken); // Changed from result.token
    });

    it('should propagate error if validateUser throws', async () => {
      const mockUserLoginDto = {
        email: 'test@example.com',
        password: 'password',
      } as UserLoginDto;

      const errorMessage = 'Invalid credentials';
      mockAuthService.validateUser.mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await expect(
        authController.userLogin(mockUserLoginDto),
      ).rejects.toThrow(errorMessage);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockUserLoginDto,
      );
      expect(mockAuthService.createAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('userRegister', () => {
    it('should register a user and return UserDto without a file', async () => {
      const mockUserRegisterDto = {
        email: 'newuser@example.com',
        password: 'newpassword',
        // add other required fields from UserRegisterDto if any
      } as UserRegisterDto;

      const mockReturnedDtoFromToDto = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        role: RoleType.USER,
        isActive: true, // toDto is called with { isActive: true }
      };

      const mockCreatedUserEntity = {
        id: 'new-user-id',
        role: RoleType.USER,
        email: 'newuser@example.com',
        toDto: jest.fn().mockReturnValue(mockReturnedDtoFromToDto),
      } as unknown as UserEntity;

      mockUserService.createUser.mockResolvedValueOnce(mockCreatedUserEntity);

      const result = await authController.userRegister(mockUserRegisterDto);

      expect(mockUserService.createUser).toHaveBeenCalledWith(
        mockUserRegisterDto,
        undefined, // No file
      );
      expect(mockCreatedUserEntity.toDto).toHaveBeenCalledWith({
        isActive: true,
      });
      expect(result).toEqual(mockReturnedDtoFromToDto);
    });

    it('should register a user and return UserDto with a file', async () => {
      const mockUserRegisterDto = {
        email: 'newuserfile@example.com',
        password: 'newpasswordfile',
      } as UserRegisterDto;

      const mockFile = {
        fieldname: 'avatar',
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
        size: 12345,
      } as IFile;

      const mockReturnedDtoFromToDto = {
        id: 'new-user-file-id',
        email: 'newuserfile@example.com',
        role: RoleType.USER,
        isActive: true,
        avatar: 'path/to/avatar.jpg', // Assuming toDto might include avatar if present
      };

      const mockCreatedUserEntity = {
        id: 'new-user-file-id',
        role: RoleType.USER,
        email: 'newuserfile@example.com',
        avatar: 'path/to/avatar.jpg',
        toDto: jest.fn().mockReturnValue(mockReturnedDtoFromToDto),
      } as unknown as UserEntity;

      mockUserService.createUser.mockResolvedValueOnce(mockCreatedUserEntity);

      const result = await authController.userRegister(
        mockUserRegisterDto,
        mockFile,
      );

      expect(mockUserService.createUser).toHaveBeenCalledWith(
        mockUserRegisterDto,
        mockFile,
      );
      expect(mockCreatedUserEntity.toDto).toHaveBeenCalledWith({
        isActive: true,
      });
      expect(result).toEqual(mockReturnedDtoFromToDto);
    });

    it('should propagate error if createUser throws', async () => {
      const mockUserRegisterDto = {
        email: 'existing@example.com',
        password: 'password',
      } as UserRegisterDto;

      const errorMessage = 'User already exists';
      mockUserService.createUser.mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await expect(
        authController.userRegister(mockUserRegisterDto),
      ).rejects.toThrow(errorMessage);

      expect(mockUserService.createUser).toHaveBeenCalledWith(
        mockUserRegisterDto,
        undefined,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return UserDto from user entity', () => {
      const mockUserDtoOutput = {
        id: 'current-user-id',
        email: 'currentuser@example.com',
        role: RoleType.ADMIN,
        // any other fields expected in UserDto
      };

      const mockUserEntityArgument = {
        id: 'current-user-id',
        email: 'currentuser@example.com',
        role: RoleType.ADMIN,
        // other UserEntity fields if necessary for toDto logic, but not for this simple mock
        toDto: jest.fn().mockReturnValue(mockUserDtoOutput),
      } as unknown as UserEntity; // Cast to UserEntity for type-safety in controller call

      const result = authController.getCurrentUser(mockUserEntityArgument);

      expect(mockUserEntityArgument.toDto).toHaveBeenCalled();
      // If toDto can take arguments, and getCurrentUser doesn't pass any,
      // we could assert: expect(mockUserEntityArgument.toDto).toHaveBeenCalledWith();
      expect(result).toEqual(mockUserDtoOutput);
    });
  });
});
