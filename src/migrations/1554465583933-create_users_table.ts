import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1554465583933 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('USER')`);
        await queryRunner.query(`
            CREATE TABLE "users"
            (
                "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "created_at"    TIMESTAMP         NOT NULL DEFAULT now(),
                "updated_at"    TIMESTAMP         NOT NULL DEFAULT now(),
                "first_name"    character varying,
                "last_name"     character varying,
                "role"          "users_role_enum" NOT NULL DEFAULT 'USER',
                "email"         character varying,
                "password"      character varying,
                "phone"         character varying,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_role_enum"`);
    }

}
