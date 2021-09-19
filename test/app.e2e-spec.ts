/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/auth/register (POST)', async () =>
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@smith.com',
                password: 'password'
            })
            .expect(200));

    it('/auth/login (POST)', async () => {
        let response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'john@smith.com',
                password: 'password'
            })
            .expect(200);

        accessToken = response.body.token.accessToken;
    });

    it('/auth/me (GET)', async () =>
        await request(app.getHttpServer())
            .get('/auth/me')
            .set({ Authorization: `Bearer ${accessToken}` })
            .expect(200));

    afterAll(async () => await app.close());
});
