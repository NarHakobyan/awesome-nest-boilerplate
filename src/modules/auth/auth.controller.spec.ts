import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AppService } from './app.service';
import { ConfigModule } from './../config';

describe('AuthController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AppService],
      imports: [ConfigModule],
    }).compile();
  });

  describe('root', () => {
    it('should return "http://localhost"', () => {
      const appController = app.get<AuthController>(AuthController);
      expect(appController.root()).toBe('http://localhost');
    });
  });
});
