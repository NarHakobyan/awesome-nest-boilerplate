import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1551350306559 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            CREATE TABLE "users"
            (
                "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "email"        character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "thumbnail"    character varying,
                "createdAt"    TIMESTAMP         NOT NULL DEFAULT now(),
                "updatedAt"    TIMESTAMP         NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
