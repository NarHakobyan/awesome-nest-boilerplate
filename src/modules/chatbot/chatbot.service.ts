import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { Document } from '@langchain/core/documents';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import {
  RunnableLambda,
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { DynamicTool } from '@langchain/core/tools';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import type { MessageEvent } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { formatDocumentsAsString } from 'langchain/util/document';
import { DateTime } from 'luxon';
import type { Observable } from 'rxjs';
import { from, map, switchMap } from 'rxjs';

import { OpenaiService } from '../../packages/langchain/openai.service';
import type { NewMessageDto } from './dtos/new-message.dto';
import { GoogleCalendarTool } from './tools/google-calendar.tool';

@Injectable()
export class ChatbotService {
  searchTool: TavilySearchResults;

  constructor(private openaiService: OpenaiService) {
    this.searchTool = new TavilySearchResults({
      apiKey: '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',
    });

    // this.assistant({
    //   text: 'What is the weather in Yerevan?',
    //   messages: [],
    // }).subscribe(console.log);
  }

  assistant(newMessageDto: NewMessageDto): Observable<MessageEvent> {
    return from(this.createAgent()).pipe(
      switchMap((executor) =>
        executor.streamEvents(
          {
            input: newMessageDto.text,
            now_datetime: DateTime.now().toFormat('dd-MM-yyyy HH:mm'),
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
          },
          {
            version: 'v1',
          },
        ),
      ),
      map((streamEvent) => ({
        data: streamEvent,
        type: 'message',
      })),
    );
  }

  private async createAgent() {
    const llm = this.openaiService.createChat();

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

    const prompt = await pull<ChatPromptTemplate>(
      'narek/openai-functions-agent',
    );

    const tools = [
      this.searchTool,
      new GoogleCalendarTool({
        model: new ChatOpenAI(),
        accessToken:
          'ya29.a0AfB_byCxyXD_Vg37ufp4O4azZAYFSXq94ICgJKhnhbGOYewOfDXSz3pn_NuLSsnMIpeVjvakiOxnFk98W_g9lEbZYApg_yBm_I8hb_td70iITLEfqEdiXQE50gye5UAnoV2eEVdcIuJ1DxWk9aRs2QwEEyjiy6IOdRM5aCgYKATQSARISFQHGX2MiD2YubYlrFDaZ9S8FAdGxNg0171',
        refreshToken:
          '1//04Ldz-0r0Ga6ICgYIARAAGAQSNwF-L9IraeHZGKU8S1MYVUDbEkYG72IDbRbpYl1W8LQU_f2rUbyktHVbTuZYtoGYoZcked9Zywo',
      }),
      new DynamicTool({
        name: 'PerfectLive',
        description:
          'call this to get info about the project perfect.live. input should be an empty string.',
        func: async () =>
          'Perfect live is personal assistant app, that helps you to manage your daily tasks and events. if you find any bugs or have any suggestions, please let Narek and not Anna :D know.',
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
      llm,
      tools,
      prompt,
    });

    return AgentExecutor.fromAgentAndTools({
      agent,
      tools,
    });
  }

  async createChatOpenAI() {
    const vectorStore = await HNSWLib.fromDocuments(
      [
        new Document({ pageContent: 'Harrison worked at Kensho' }),
        new Document({ pageContent: 'Bears like to eat honey.' }),
      ],
      new OpenAIEmbeddings(),
    );
    const retriever = vectorStore.asRetriever(1);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'ai',
        `Answer the question based on only the following context:

<context>
{context}
</context>
`,
      ],
      ['human', '{question}'],
    ]);
    const model = new ChatOpenAI();
    const outputParser = new StringOutputParser();

    const setupAndRetrieval = RunnableMap.from({
      context: new RunnableLambda({
        func: (input: string) =>
          retriever.invoke(input).then((response) => response[0]?.pageContent),
      }).withConfig({ runName: 'contextRetriever' }),
      question: new RunnablePassthrough(),
    });
    const chain = setupAndRetrieval.pipe(prompt).pipe(model).pipe(outputParser);

    const response = await chain.invoke('Where did Harrison work?');

    console.log(response);
  }

  async createChatOpenAIJson() {
    const model = new ChatOpenAI({});

    const vectorStore = await HNSWLib.fromTexts(
      ['mitochondria is the powerhouse of the cell'],
      [{ id: 1 }],
      new OpenAIEmbeddings(),
    );
    const retriever = vectorStore.asRetriever();

    const prompt =
      PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

Question: {question}`);

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke('What is the powerhouse of the cell?');

    console.log(result);
  }

  async createChatOpenAIJson2() {
    const model = new ChatOpenAI({});

    const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;
    const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
      condenseQuestionTemplate,
    );

    const answerTemplate = `Answer the question based only on the following context:
{context}

Question: {question}
`;
    const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

    const formatChatHistory = (chatHistory: Array<[string, string]>) => {
      const formattedDialogueTurns = chatHistory.map(
        (dialogueTurn) =>
          `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`,
      );

      return formattedDialogueTurns.join('\n');
    };

    const vectorStore = await HNSWLib.fromTexts(
      [
        'mitochondria is the powerhouse of the cell',
        'mitochondria is made of lipids',
      ],
      [{ id: 1 }, { id: 2 }],
      new OpenAIEmbeddings(),
    );
    const retriever = vectorStore.asRetriever();

    interface ConversationalRetrievalQAChainInput {
      question: string;
      chat_history: Array<[string, string]>;
    }

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) =>
          input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          formatChatHistory(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      model,
      new StringOutputParser(),
    ]);

    const answerChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      ANSWER_PROMPT,
      model,
    ]);

    const conversationalRetrievalQAChain =
      standaloneQuestionChain.pipe(answerChain);

    const result1 = await conversationalRetrievalQAChain.invoke({
      question: 'What is the powerhouse of the cell?',
      chat_history: [],
    });
    console.log(result1);
    /*
    AIMessage { content: "The powerhouse of the cell is the mitochondria." }
  */

    const result2 = await conversationalRetrievalQAChain.invoke({
      question: 'What are they made out of?',
      chat_history: [
        [
          'What is the powerhouse of the cell?',
          'The powerhouse of the cell is the mitochondria.',
        ],
      ],
    });
    console.log(result2);
  }
}
