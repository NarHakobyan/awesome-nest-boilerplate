import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { DynamicTool } from '@langchain/core/tools';
import { ChatOpenAI, OpenAI } from '@langchain/openai';
import type { MessageEvent } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { DateTime } from 'luxon';
import type { Observable } from 'rxjs';
import { from, map, switchMap } from 'rxjs';

import { ApiConfigService } from '../../shared/services/api-config.service.ts';
import type { NewMessageDto } from './dtos/new-message.dto';
import { GoogleCalendarViewTool } from './tools/google-calendar-view.tool.ts';
import { GoogleCalendarCreateTool } from './tools/google-calendar-create.tool.ts';

@Injectable()
export class ConciergeService {
  accessToken =
    'ya29.a0AfB_byCxyXD_Vg37ufp4O4azZAYFSXq94ICgJKhnhbGOYewOfDXSz3pn_NuLSsnMIpeVjvakiOxnFk98W_g9lEbZYApg_yBm_I8hb_td70iITLEfqEdiXQE50gye5UAnoV2eEVdcIuJ1DxWk9aRs2QwEEyjiy6IOdRM5aCgYKATQSARISFQHGX2MiD2YubYlrFDaZ9S8FAdGxNg0171';

  refreshToken =
    '1//04Ldz-0r0Ga6ICgYIARAAGAQSNwF-L9IraeHZGKU8S1MYVUDbEkYG72IDbRbpYl1W8LQU_f2rUbyktHVbTuZYtoGYoZcked9Zywo';

  constructor(private apiConfigService: ApiConfigService) {}

  assistant(newMessageDto: NewMessageDto): Observable<MessageEvent> {
    return from(this.createAgent()).pipe(
      switchMap((executor) =>
        executor.stream({
          input: newMessageDto.text,
          now_datetime: DateTime.now().toFormat('YYYY-MM-DDThh:mm:ss'),
          chat_history: newMessageDto.messages.map((message) => {
            switch (message.sender) {
              case 'AI': {
                return new AIMessage(message.text);
              }

              case 'USER': {
                return new HumanMessage(message.text);
              }
            }
          }),
        }),
      ),
      switchMap((stream) => from(stream)),
      map((streamEvent: any) => {
        const intermediateSteps = streamEvent.intermediateSteps;

        if (intermediateSteps) {
          return {
            data: intermediateSteps[0].action.toolInput,
            type: 'message',
          };
        }

        return {
          data: streamEvent.output,
          type: 'message',
        };
      }),
    );
  }

  private async createAgent() {
    //     const template = `You are a helpful assistant. Help the user answer any questions.
    //
    // You have access to the following tools:
    //
    // {tools}
    //
    // In order to use a tool, you can use <tool></tool> and <tool_input></tool_input> tags. \
    // You will then get back a response in the form <observation></observation>
    // For example, if you have a tool called 'search' that could run a google search, in order to search for the weather in SF you would respond:
    //
    // <tool>search</tool><tool_input>weather in SF</tool_input>
    // <observation>64 degrees</observation>
    //
    // When you are done, respond with a final answer between <final_answer></final_answer>. For example:
    //
    // <final_answer>The weather in SF is 64 degrees</final_answer>
    //
    // Begin!
    //
    // Question: {input}`;

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `As my Senior Personal Assistant, I rely on your expertise to organize my leisure time with high-quality experiences.
I'm looking for recommendations on upscale dining establishments, exclusive activities, and unique cultural events within the New York City area for the upcoming weekend.
Please prioritize options that offer a memorable and sophisticated experience, suitable for a business professional looking to unwind.
I prefer venues that are renowned for their ambiance, quality of service, and exceptional offerings.
Provide a list that includes a brief description of each recommendation, why it stands out, and any necessary reservation details or entry requirements.
Current datetime is {now_datetime}`,
      ],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    const googleCalendarConfig = this.apiConfigService.googleCalendarConfig;
    const tools: StructuredToolInterface[] = [
      new TavilySearchResults({
        apiKey: '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',
      }),
      new GoogleCalendarViewTool({
        clientId: googleCalendarConfig.clientId,
        clientSecret: googleCalendarConfig.clientSecret,
        redirectUri: googleCalendarConfig.redirectUri,
        model: new OpenAI({
          temperature: 0,
        }),
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      }),
      new GoogleCalendarCreateTool({
        clientId: googleCalendarConfig.clientId,
        clientSecret: googleCalendarConfig.clientSecret,
        redirectUri: googleCalendarConfig.redirectUri,
        model: new OpenAI({
          temperature: 0,
        }),
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      }),
      new DynamicTool({
        name: 'PerfectLive',
        description:
          'call this to get info about the project perfect.live. input should be an empty string.',
        func: () =>
          Promise.resolve(
            'Perfect live is personal assistant app, that helps you to manage your daily tasks and events. if you find any bugs or have any suggestions, please let Narek and not Anna :D know.',
          ),
      }),
      // new DynamicStructuredTool({
      //   name: 'random-number-generator',
      //   description: 'generates a random number between two input numbers',
      //   schema: z.object({
      //     low: z.number().describe('The lower bound of the generated number'),
      //     high: z.number().describe('The upper bound of the generated number'),
      //   }),
      //   func: async ({ low, high }) =>
      //     (Math.random() * (high - low) + low).toString(), // Outputs still must be strings
      // }),
    ];

    const agent = await createOpenAIFunctionsAgent({
      llm: new ChatOpenAI({
        modelName: 'gpt-3.5-turbo-1106',
        temperature: 0,
      }),
      tools,
      prompt,
    });

    return AgentExecutor.fromAgentAndTools({
      agent,
      tools,
    });
  }
}
