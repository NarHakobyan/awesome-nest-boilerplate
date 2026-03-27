# Code Generation

- [Code Generation](#code-generation)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Generators and Their Commands](#generators-and-their-commands)
      - [Resource Generator](#resource-generator)
  - [Stay in touch](#stay-in-touch)
  - [License](#license)

## Installation

Make sure you have the [Awesome Nest Schematics](https://github.com/NarHakobyan/awesome-nest-schematics) installed in your project.

If you don't have it installed, you can install it by running the following command:
```bash
pnpm add -D awesome-nest-schematics
```

## Usage

To generate code using the schematics, run the following command:

```bash
$ nest g -c awesome-nestjs-schematics <schematic>
```

OR

```bash
$ pnpm generate<schematic> <name>
```


For example, to generate a new controller:

```bash
$ pnpm generatecontroller
```

## Generators and Their Commands

#### Resource Generator

Generate a new Nest resource, including a controller, service, and module.
  ```bash
  $ pnpm generateresource
  ```

- **DTO**: Generate a new Data Transfer Object.
  ```bash
  $ pnpm generatedto
  ```

- **Controller**: Generate a new Nest controller.
  ```bash
  $ pnpm generatecontroller
  ```

- **Decorator**: Generate a new Nest decorator.
  ```bash
  $ pnpm generatedecorator
  ```

- **Filter**: Generate a new Nest filter.
  ```bash
  $ pnpm generatefilter
  ```

- **Guard**: Generate a new Nest guard.
  ```bash
  $ pnpm generateguard
  ```

- **Interceptor**: Generate a new Nest interceptor.
  ```bash
  $ pnpm generateinterceptor
  ```

- **Interface**: Generate a new Nest interface.
  ```bash
  $ pnpm generateinterface
  ```

- **Middleware**: Generate a new Nest middleware.
  ```bash
  $ pnpm generatemiddleware
  ```

- **Module**: Generate a new Nest module.
  ```bash
  $ pnpm generatemodule
  ```

- **Pipe**: Generate a new Nest pipe.
  ```bash
  $ pnpm generatepipe
  ```

- **Provider**: Generate a new Nest provider.
  ```bash
  $ pnpm generateprovider
  ```

- **Service**: Generate a new Nest service.
  ```bash
  $ pnpm generateservice
  ```

## Stay in touch

- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/NarHQ)

## License

Nest is [MIT licensed](LICENSE).
