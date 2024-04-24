import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { Document } from '@langchain/core/documents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import {
  RunnableLambda,
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { formatDocumentsAsString } from 'langchain/util/document';

@Injectable()
export class ChatbotService {
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
