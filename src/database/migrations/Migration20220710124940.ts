import { Migration } from '@mikro-orm/migrations';

export class Migration20220710124940 extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    this.addSql(`
      create table "users"
      (
        "id"         uuid                                     not null default uuid_generate_v4(),
        "created_at" timestamptz(3)                           not null default current_timestamp(3),
        "updated_at" timestamptz(3)                           not null default current_timestamp(3),
        "first_name" varchar(255)                             null,
        "last_name"  varchar(255)                             null,
        "role"       text check ("role" in ('USER', 'ADMIN')) not null default 'USER',
        "email"      varchar(255)                             null,
        "password"   varchar(255)                             null,
        "phone"      varchar(255)                             null,
        "avatar"     varchar(255)                             null
      );`);
    this.addSql(
      'alter table "users" add constraint "users_email_unique" unique ("email");',
    );
    this.addSql(
      'alter table "users" add constraint "users_pkey" primary key ("id");',
    );

    this.addSql(`
      create table "user_settings"
      (
        "id"                uuid           not null default uuid_generate_v4(),
        "created_at"        timestamptz(3) not null default current_timestamp(3),
        "updated_at"        timestamptz(3) not null default current_timestamp(3),
        "is_email_verified" boolean        not null default false,
        "is_phone_verified" boolean        not null default false,
        "user_id"           uuid           not null
      );`);
    this.addSql(
      'alter table "user_settings" add constraint "user_settings_user_id_unique" unique ("user_id");',
    );
    this.addSql(
      'alter table "user_settings" add constraint "user_settings_pkey" primary key ("id");',
    );

    this.addSql(
      'alter table "user_settings" add constraint "user_settings_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_settings" drop constraint "user_settings_user_id_foreign";',
    );

    this.addSql('drop table if exists "users" cascade;');

    this.addSql('drop table if exists "user_settings" cascade;');
  }
}
