import { jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { RolesGuard } from '../../guards/roles.guard.ts';
import { AuthService } from './auth.service.ts';
import { AuthController } from './auth.controller.ts';
import { UserService } from '../user/user.service.ts';

describe('AuthController', () => {
  let controller: AuthController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        Reflector,
        {
          provide: AuthService,
          useValue: { validateUser: jest.fn(), createAccessToken: jest.fn() },
        },
        { provide: UserService, useValue: { createUser: jest.fn() } },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = app.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
