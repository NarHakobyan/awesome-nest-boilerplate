import { Module, DynamicModule } from '@nestjs/common';
import { MessageQueueService } from './message-queue.service';
import { MicroserviceConfigs } from './MicroserviceConfigs';

@Module({})
export class MicroserviceModule {
    static forRoot(options: { autoConnect: boolean }): DynamicModule {
        return {
            module: MicroserviceModule,
            providers: [
                {
                    provide: MicroserviceConfigs,
                    useValue: options,
                },
                MessageQueueService,
            ],
            exports: [MessageQueueService],
        };
    }
}
