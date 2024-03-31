import { type DynamicModule, Module } from '@nestjs/common';

import {
  type LANGCHAIN_ASYNC_OPTIONS_TYPE,
  type LANGCHAIN_OPTIONS_TYPE,
  LangchainConfigurableModuleClass,
} from './langchain.module-definition';
import { OpenaiService } from './openai.service';
import { OutputParserService } from './output-parser.service';

const services = [OpenaiService, OutputParserService];
@Module({
  imports: [],
  exports: [...services],
  providers: [...services],
})
export class LangchainModule extends LangchainConfigurableModuleClass {
  static forRoot(options: typeof LANGCHAIN_OPTIONS_TYPE): DynamicModule {
    const { providers, exports, ...rest } = super.forRoot(options);

    return {
      providers: [...(providers ?? []), ...services],
      exports: [...(exports ?? []), ...services],
      ...rest,
    };
  }

  static forRootAsync(
    options: typeof LANGCHAIN_ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    const { providers, exports, ...rest } = super.forRootAsync(options);

    return {
      providers: [...(providers ?? []), ...services],
      exports: [...(exports ?? []), ...services],
      ...rest,
    };
  }
}
