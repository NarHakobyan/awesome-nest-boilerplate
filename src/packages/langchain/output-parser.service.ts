import { StringOutputParser } from '@langchain/core/output_parsers';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OutputParserService {
  get string(): StringOutputParser {
    if (!this._string) {
      this._string = new StringOutputParser();
    }

    return this._string;
  }

  private _string?: StringOutputParser;
}
