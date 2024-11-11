# Awesome NestJS Boilerplate v10

[![Awesome NestJS](https://img.shields.io/badge/Awesome-NestJS-blue.svg?longCache=true&style=flat-square)](https://github.com/juliandavidmr/awesome-nestjs)

> This is an ever-evolving, very opinionated architecture and dev environment for new node projects using [NestJS](https://nestjs.com). Questions, feedback, and for now, even bikeshedding are welcome. 😄

## Getting started

```bash
# 1. Clone the repository or click on "Use this template" button.
npx degit NarHakobyan/awesome-nest-boilerplate my-nest-app

# 2. Enter your newly-cloned folder.
cd my-nest-app

# 3. Create Environment variables file.
cp .env.example .env

# 3. Install dependencies. (Make sure yarn is installed: https://yarnpkg.com/lang/en/docs/install)
yarn
```

## Checklist

When you use this template, try follow the checklist to update your info properly

- [ ] Change the author name in `LICENSE`
- [ ] Change configurations in `.env`
- [ ] Remove the `.github` folder which contains the funding info
- [ ] Clean up the README.md file

And, enjoy :)
<details>
  <summary>Node Development</summary>

### Scripts

```bash
# 4. Run development server and open http://localhost:3000
yarn start:dev

# 5. Read the documentation linked below for "Setup and development".
```

### Build

To build the App, run

```bash
yarn build:prod
```

And you will see the generated file in `dist` that ready to be served.

</details>

<details>
  <summary>Deno Development</summary>

We are excited to announce that this project now supports Deno! You can use Deno to run, build, and test your application. 🦕

#### Scripts

Here are the available scripts for Deno:

```bash
# Start the development server
deno task start

# Start the server with file watcher
deno task watch

# Run tests
deno task test

# Compile the application (not working yet)
deno task compile
```

To build the App using Deno, run:

```bash
deno task buildr
```

And you will see the generated file in `dist` that is ready to be served.

</details>

<details>
  <summary>Bun Development</summary>

We are excited to announce that this project now supports Bun! You can use Bun to run, build, and test your application. 🧅

#### Scripts

Here are the available scripts for Bun:

```bash
# Start the development server
bun start:dev:bun

# Start the server with file watcher
bun watch:bun

# Run tests

bun test

# Build the application

bun build:bun
```

And you will see the generated file in `dist` that is ready to be served.

</details>


## Features

<dl>
  <!-- <dt><b>Quick scaffolding</b></dt>
  <dd>Create modules, services, controller - right from the CLI!</dd> -->

  <dt><b>Instant feedback</b></dt>
  <dd>Enjoy the best DX (Developer eXperience) and code your app at the speed of thought! Your saved changes are reflected instantaneously.</dd>

  <dt><b>JWT Authentication</b></dt>
  <dd>Installed and configured JWT authentication.</dd>

  <dt><b>Next generation Typescript</b></dt>
  <dd>Always up to date typescript version.</dd>

  <dt><b>Industry-standard routing</b></dt>
  <dd>It's natural to want to add pages (e.g. /about`) to your application, and routing makes this possible.</dd>

  <dt><b>Environment Configuration</b></dt>
  <dd>development, staging and production environment configurations</dd>

  <dt><b>Swagger Api Documentation</b></dt>
  <dd>Already integrated API documentation. To see all available endpoints visit http://localhost:3000/documentation</dd>

  <dt><b>Node, Bun, Deno</b></dt>
  <dd>Support for Node, Bun, and Deno. You can run, build, and test your application using any of these runtime.</dd>

  <dt><b>Linter</b></dt>
  <dd>eslint + prettier = ❤️</dd>
</dl>

## Documentation

This project includes a `docs` folder with more details on:

1.  [Setup and development](https://narhakobyan.github.io/awesome-nest-boilerplate/docs/development.html#first-time-setup)
1.  [Architecture](https://narhakobyan.github.io/awesome-nest-boilerplate/docs/architecture.html)
1.  [Naming Cheatsheet](https://narhakobyan.github.io/awesome-nest-boilerplate/docs/naming-cheatsheet.html)

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discuss Awesome NestJS Boilerplate on GitHub](https://github.com/NarHakobyan/awesome-nest-boilerplate/discussions)
