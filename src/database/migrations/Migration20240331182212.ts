import { Migration } from '@mikro-orm/migrations';

export class Migration20240331182212 extends Migration {

   up(): void {
    this.addSql('create extension if not exists "uuid-ossp";');
    this.addSql(`
    create type "user_role_type" as enum ('USER', 'ADMIN');`);
    this.addSql(`
      create table "users"
      (
        "id"         uuid             not null default uuid_generate_v4(),
        "created_at" timestamp        not null default now(),
        "updated_at" timestamp        not null default now(),
        "first_name" varchar(255)     null,
        "last_name"  varchar(255)     null,
        "role"       "user_role_type" not null default 'USER',
        "email"      varchar(255)     null,
        "password"   varchar(255)     null,
        "phone"      varchar(255)     null,
        "avatar"     varchar(255)     null,
        constraint "users_pkey" primary key ("id")
      );`);
    this.addSql(
      'alter table "users" add constraint "users_email_unique" unique ("email");',
    );

    this.addSql(`
      create table "user_settings"
      (
        "id"                uuid        not null default uuid_generate_v4(),
        "created_at"        timestamp not null default now(),
        "updated_at"        timestamp not null default now(),
        "is_email_verified" boolean     not null default false,
        "is_phone_verified" boolean     not null default false,
        "user_id"           uuid        null,
        constraint "user_settings_pkey" primary key ("id")
      );`);
    this.addSql(
      'alter table "user_settings" add constraint "user_settings_user_id_unique" unique ("user_id");',
    );

    this.addSql(`
      alter table "user_settings"
        add constraint "user_settings_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);
  }

   down(): void {
    this.addSql(
      'alter table "user_settings" drop constraint "user_settings_user_id_foreign";',
    );

    this.addSql('drop table if exists "users" cascade;');

    this.addSql('drop table if exists "user_settings" cascade;');

    this.addSql('drop type "user_role_type";');

    this.addSql('drop extension if exists "uuid-ossp";')
  }

}
