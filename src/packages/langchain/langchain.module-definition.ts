import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { LangchainModuleOptions } from './interfaces/langchain-module-options.interface';

export const {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ConfigurableModuleClass: LangchainConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: LANGCHAIN_MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE: LANGCHAIN_ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE: LANGCHAIN_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<LangchainModuleOptions>()
  .setFactoryMethodName('forRootAsync')
  .setClassMethodName('forRoot')
  .build();
