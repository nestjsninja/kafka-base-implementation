import { DynamicModule, Module } from '@nestjs/common';
import { MessagingInfrastructureModule } from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingService } from './example-messaging.service';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

@Module({})
export class ExampleMessagingModule {
  static register(options: { ensureTopics?: boolean } = {}): DynamicModule {
    return {
      module: ExampleMessagingModule,
      imports: [
        MessagingInfrastructureModule.register({
          topics: EXAMPLE_KAFKA_TOPICS,
          ensureTopics: options.ensureTopics ?? true,
          producerOnlyMode: true,
        }),
      ],
      providers: [ExampleMessagingService],
      exports: [ExampleMessagingService],
    };
  }
}
