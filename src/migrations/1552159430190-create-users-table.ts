import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1552159430190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
        CREATE TYPE "users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'USER');
        `);
        await queryRunner.query(`
            CREATE TABLE "users"
            (
                "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt"    TIMESTAMP         NOT NULL DEFAULT now(),
                "updatedAt"    TIMESTAMP         NOT NULL DEFAULT now(),
                "firstName"    character varying NOT NULL,
                "lastName"     character varying NOT NULL,
                "age"          integer           NOT NULL,
                "role"         "users_role_enum" NOT NULL,
                "email"        character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "thumbnail"    character varying,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_role_enum"`);
    }

}
