import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { LangchainModuleOptions } from './interfaces/langchain-module-options.interface';
import { LANGCHAIN_MODULE_OPTIONS_TOKEN } from './langchain.module-definition';

@Injectable()
export class OpenaiService {
  get stringOutputParser(): StringOutputParser {
    if (!this._stringOutputParser) {
      this._stringOutputParser = new StringOutputParser();
    }

    return this._stringOutputParser;
  }

  private _stringOutputParser?: StringOutputParser;

  constructor(
    @Inject(LANGCHAIN_MODULE_OPTIONS_TOKEN)
    private options: LangchainModuleOptions,
  ) {}

  createChat() {
    return new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-1106',
      openAIApiKey: this.options.openAIKey,
      temperature: 0,
    });
    //   .bind({
    //   response_format: {
    //     type: 'json_object',
    //   },
    // });
  }

  createEmbedding() {
    return new OpenAIEmbeddings({
      openAIApiKey: this.options.openAIKey,
    });
  }
}
