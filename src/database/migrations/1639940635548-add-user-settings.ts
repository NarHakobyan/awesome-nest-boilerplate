import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUserSettings1639940635548 implements MigrationInterface {
  name = 'addUserSettings1639940635548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_settings"
      (
        "id"                uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"        TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP NOT NULL DEFAULT now(),
        "is_email_verified" boolean   NOT NULL DEFAULT false,
        "is_phone_verified" boolean   NOT NULL DEFAULT false,
        "user_id"           uuid      NOT NULL,
        CONSTRAINT "REL_19f4e08665a1f4bbbb7d5631f3" UNIQUE ("user_id"),
        CONSTRAINT "PK_0fbe28c9f064a04d90aca6b3514" PRIMARY KEY ("id")
      )`);
    await queryRunner.query(`ALTER TABLE "user_settings"
      ADD CONSTRAINT "FK_19f4e08665a1f4bbbb7d5631f35" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings"
      DROP CONSTRAINT "FK_19f4e08665a1f4bbbb7d5631f35"`);
    await queryRunner.query('DROP TABLE "user_settings"');
  }
}
