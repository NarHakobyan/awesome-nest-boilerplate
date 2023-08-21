import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPostsTable1641994291086 implements MigrationInterface {
  name = 'addPostsTable1641994291086';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings"
      DROP CONSTRAINT "FK_19f4e08665a1f4bbbb7d5631f35"`);
    await queryRunner.query(`
        CREATE TYPE "public"."post_translations_language_code_enum" AS ENUM('en_US', 'ru_RU')`);
    await queryRunner.query(`
      CREATE TABLE "post_translations"
      (
        "id"            uuid                                            NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    TIMESTAMP                                       NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP                                       NOT NULL DEFAULT now(),
        "title"         character varying                               NOT NULL,
        "description"   character varying                               NOT NULL,
        "post_id"       uuid                                            NOT NULL,
        "language_code" "public"."post_translations_language_code_enum" NOT NULL,
        CONSTRAINT "PK_977f23a9a89bf4a1a9e2e29c136" PRIMARY KEY ("id")
      )`);
    await queryRunner.query(`
      CREATE TABLE "posts"
      (
        "id"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id"    uuid      NOT NULL,
        CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
      )`);
    await queryRunner.query(`
      ALTER TABLE "post_translations"
        ADD CONSTRAINT "FK_11f143c8b50a9ff60340edca475" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`
      ALTER TABLE "posts"
        ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`
      ALTER TABLE "user_settings"
        ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings"
      DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`);
    await queryRunner.query(`ALTER TABLE "posts"
      DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`);
    await queryRunner.query(`ALTER TABLE "post_translations"
      DROP CONSTRAINT "FK_11f143c8b50a9ff60340edca475"`);
    await queryRunner.query('DROP TABLE "posts"');
    await queryRunner.query('DROP TABLE "post_translations"');
    await queryRunner.query(
      'DROP TYPE "public"."post_translations_language_code_enum"',
    );
    await queryRunner.query(`ALTER TABLE "user_settings"
      ADD CONSTRAINT "FK_19f4e08665a1f4bbbb7d5631f35" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
