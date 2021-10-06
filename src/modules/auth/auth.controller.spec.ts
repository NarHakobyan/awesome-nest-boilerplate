import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [],
      imports: [],
    }).compile();
  });

  // describe('root', () => {
  //   it('should return "http://localhost"', () => {
  //     const appController = app.get<AuthController>(AuthController);
  //     expect(appController.root()).toBe('http://localhost');
  //   });
  // });
});
