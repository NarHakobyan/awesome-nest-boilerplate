import 'dotenv/config';

import { Injectable } from '@nestjs/common';
import { loadQAStuffChain, RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PromptTemplate } from 'langchain/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from 'langchain/vectorstores/faiss';

import { OpenaiService } from '../../packages/langchain/openai.service';
import { OutputParserService } from '../../packages/langchain/output-parser.service';

@Injectable()
export class ChatbotService {
  constructor(
    private openAiService: OpenaiService,
    private outputParserService: OutputParserService,
  ) {}

  async createChatOpenAI() {
    // List of videos to load into the vector database
    const videos = [
      'https://www.youtube.com/watch?v=kOZFk1obYdY',
      'https://www.youtube.com/watch?v=DLwB4MEZ6yI',
      'https://www.youtube.com/watch?v=WpdL8bAlIbY',
    ];

    // Create an array of promises to load the videos in parallel
    const loaders = videos.map((url) =>
      YoutubeLoader.createFromUrl(url, {
        language: 'en',
        addVideoInfo: true,
      }),
    );

    // Load the videos in parallel
    const docs = await Promise.all(loaders.map((loader) => loader.load()));

    // Create a text transformer that will split the text into chunks of 1000 characters
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });

    // Split the documents into chunks of 1000 characters
    const texts = await splitter.splitDocuments(docs.flat());

    // Create an in-memory Faiss vector store from the documents using the OpenAI embeddings model
    const vectorStore = await FaissStore.fromDocuments(
      texts,
      new OpenAIEmbeddings(),
    );

    // Create a retriever from the vector store to perform the similarity search
    const retriever = vectorStore.asRetriever();

    // Create a chat model that will be used to answer the questions
    const model = new ChatOpenAI({
      model: 'gpt-3.5-turbo-16k',
    });

    // Create a prompt template that will be used to format the questions
    const template = `You will answer technical questions about Salesforce Development, you will use a friendly language, if there is source code make sure it is properly formatted using markdown. Answer the questions based on the following context, which is part of a YouTube video transcript:
----
{context}
----
Question: {question}
Answer:`;

    const QA_CHAIN_PROMPT = new PromptTemplate({
      inputVariables: ['context', 'question'],
      template,
    });

    // Create a retrieval QA chain that will combine the documents, the retriever and the chat model
    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQAStuffChain(model, {
        prompt: QA_CHAIN_PROMPT,
      }),
      retriever,
      returnSourceDocuments: true,
      inputKey: 'question',
    });

    // Ask some questions
    await askQuestion('How to perform a HTTP callout in Apex?');
    await askQuestion(
      'How to perform a POST request in Lightning Web Components?',
    );

    // Utility function to ask a question and print the answer using the previously created chain
    async function askQuestion(question) {
      console.log('-----------------------------------');
      console.log(`🙋‍♂️ ${question}`);
      const query = await chain.call({ question });
      console.log('ℹ️  Answer:\n');
      console.log(query.text);
      showSources(query);
    }

    // Utility function to print the sources of the documents that were used to answer the question, in this case, the videos
    function showSources(query) {
      const sources = [
        ...new Set(query.sourceDocuments.map((doc) => doc.metadata.source)),
      ];
      console.log('Related Videos:');

      for (const source of sources) {
        console.log('📺 https://youtube.com/watch?v=' + source);
      }
    }
  }
}
