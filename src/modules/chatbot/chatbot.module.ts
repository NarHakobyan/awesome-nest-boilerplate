import { Module } from '@nestjs/common';

import { LangchainModule } from '../../packages/langchain/langchain.module';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { SharedModule } from '../../shared/shared.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ConciergeService } from './concierge.service.ts';

const handlers = [];

@Module({
  imports: [
    LangchainModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory(config: ApiConfigService) {
        return {
          openAIKey: config.openAI.apiKey,
        };
      },
    }),
  ],
  controllers: [ChatbotController],
  exports: [ChatbotService, ConciergeService],
  providers: [ChatbotService, ConciergeService, ...handlers],
})
export class ChatbotModule {}
