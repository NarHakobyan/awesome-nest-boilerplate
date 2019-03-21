# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
  - [Installation](#installation)
  - [Dev server](#dev-server)
  - [Generators](#generators)

## First-time setup

Make sure you have the following installed:

- [Node](https://nodejs.org/en/) (at least the latest LTS)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/) (at least 1.0)

Then update the following files to suit your application:

## Installation

```bash
# Install dependencies from package.json
# note: don't delete yarn.lock before installation
yarn install
```

## Dev server

> Note: If you're on Linux and see an `ENOSPC` error when running the commands below, you must [increase the number of available file watchers](https://stackoverflow.com/questions/22475849/node-js-error-enospc#answer-32600959).

```bash
# Launch the dev server
yarn start:dev

# Launch the dev server and anable remote debugger
yarn debug:dev
```

## Generators

This project includes generators to speed up common development tasks. Commands include:

> Note: Make sure you already have the nest-cli globally installed

```bash
# Install nest-cli globally
yarn global add @nestjs/cli

# Generate a new service
nest generate service users

# Generate a new class
nest g class users

```

If you love generators then you can find full list of command in official [Nest-cli Docs](https://docs.nestjs.com/cli/usages#generate-alias-g).
