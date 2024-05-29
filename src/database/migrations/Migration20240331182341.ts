import { Migration } from '@mikro-orm/migrations';

export class Migration20240331182341 extends Migration {

  up(): void {
    this.addSql(`
      create table "posts"
      (
        "id"         uuid      not null default uuid_generate_v4(),
        "created_at" timestamp not null default now(),
        "updated_at" timestamp not null default now(),
        "user_id"    uuid      not null,
        constraint "posts_pkey" primary key ("id")
      );`);

    this.addSql(`
      create table "post_translations"
      (
        "id"            uuid                                               not null default uuid_generate_v4(),
        "created_at"    timestamp                                          not null default now(),
        "updated_at"    timestamp                                          not null default now(),
        "language_code" text check ("language_code" in ('en_US', 'ru_RU')) not null,
        "title"         varchar(255)                                       not null,
        "description"   varchar(255)                                       not null,
        "post_id"       uuid                                               not null,
        constraint "post_translations_pkey" primary key ("id")
      );`);

    this.addSql(`
      alter table "posts"
        add constraint "posts_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);

    this.addSql(`
      alter table "post_translations"
        add constraint "post_translations_post_id_foreign" foreign key ("post_id") references "posts" ("id") on update cascade on delete cascade;`);
  }

  down(): void {
    this.addSql(
      'alter table "post_translations" drop constraint "post_translations_post_id_foreign";',
    );

    this.addSql('drop table if exists "posts" cascade;');

    this.addSql('drop table if exists "post_translations" cascade;');
  }
}
