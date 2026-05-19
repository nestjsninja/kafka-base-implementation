import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { KafkaAdminService } from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingModuleOptions } from './example-messaging.interfaces';
import { EXAMPLE_MESSAGING_MODULE_OPTIONS } from './example-messaging.tokens';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

@Module({})
export class ExampleMessagingModule implements OnModuleInit {
  static forRoot(options: ExampleMessagingModuleOptions = {}): DynamicModule {
    return {
      module: ExampleMessagingModule,
      providers: [
        {
          provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
          useValue: {
            ensureTopics: options.ensureTopics ?? false,
          },
        },
      ],
    };
  }

  constructor(
    private readonly kafkaAdminService: KafkaAdminService,
    @Inject(EXAMPLE_MESSAGING_MODULE_OPTIONS)
    private readonly options: Required<ExampleMessagingModuleOptions>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.options.ensureTopics) {
      return;
    }

    await this.kafkaAdminService.ensureTopics(EXAMPLE_KAFKA_TOPICS);
  }
}
