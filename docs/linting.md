# Linting & formatting

- [Languages](#languages)
- [Scripts](#scripts)
  - [Terminal](#terminal)
  - [Pre-commit](#pre-commit)
  - [Editor](#editor)
- [Configuration](#configuration)
- [FAQ](#faq)

This project uses Typescript Eslint, and Prettier to catch errors and avoid bike-shedding by enforcing a common code style.

## Languages

- **JavaScript** is linted by Typescript Eslint and formatted by Prettier
- **JSON** is formatted by Prettier

## Scripts

There are a few different contexts in which the linters run.

### Terminal

```bash
# Lint all files without auto-fixing
yarn lint
```

```bash
# Lint all files, fixing many violations automatically
yarn lint:fix
```

See `package.json` to update.

### Pre-commit

Staged files are automatically linted and tested before each commit. See `lint-staged.config.js` to update.

### Editor

In supported editors, all files will be linted and show under the linter errors section.

## Configuration

This boilerplate ships with opinionated defaults, but you can edit each tools configuration in the following config files:

- [ESLint](https://eslint.org/docs/user-guide/configuring)
  - `.eslintrc.js`
  - `.eslintignore`

## FAQ

**So many configuration files! Why not move more of this to `package.json`?**

- Moving all possible configs to `package.json` can make it _really_ packed, so that quickly navigating to a specific config becomes difficult.
- When split out into their own file, many tools provide the option of exporting a config from JS. I do this wherever possible, because dynamic configurations are simply more powerful, able to respond to environment variables and much more.
