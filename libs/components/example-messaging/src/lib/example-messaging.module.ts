import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  KafkaModule,
  KafkaAdminService,
} from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingConfig } from './example-messaging.config';
import { ExampleMessagingModuleOptions } from './example-messaging.interfaces';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  EXAMPLE_MESSAGING_MODULE_OPTIONS,
  OPTIONS_TYPE,
} from './example-messaging.module-definition';
import { ExampleMessagingService } from './example-messaging.service';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

@Module({})
export class ExampleMessagingModule
  extends ConfigurableModuleClass
  implements OnModuleInit {

  static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
    return {
      global: true,
      module: ExampleMessagingModule,
      imports: [
        KafkaModule.registerAsync({
          ...ExampleMessagingConfig.asProvider(),
          useFactory: (config: ConfigType<typeof ExampleMessagingConfig>) => ({
            brokers: config.brokers,
            clientId: config.clientId,
            groupId: config.groupId,
          }),
        }),
      ],
      providers: [
        ExampleMessagingService,
        {
          provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
          useValue: { ensureTopics: options.ensureTopics ?? true },
        },
      ],
      exports: [ExampleMessagingService],
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      global: true,
      module: ExampleMessagingModule,
      imports: [
        ...(options.imports ?? []),
        KafkaModule.registerAsync({
          ...ExampleMessagingConfig.asProvider(),
          useFactory: (config: ConfigType<typeof ExampleMessagingConfig>) => ({
            brokers: config.brokers,
            clientId: config.clientId,
            groupId: config.groupId,
          }),
        }),
      ],
      providers: [
        ExampleMessagingService,
        {
          provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: async (...args) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const opts = await options.useFactory!(...args);
            return { ensureTopics: opts.ensureTopics ?? true };
          },
        },
      ],
      exports: [ExampleMessagingService],
    };
  }

  constructor(
    private readonly kafkaAdminService: KafkaAdminService,
    @Inject(EXAMPLE_MESSAGING_MODULE_OPTIONS)
    private readonly options: ExampleMessagingModuleOptions,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    if (!this.options.ensureTopics) {
      return;
    }

    await this.kafkaAdminService.ensureTopics(EXAMPLE_KAFKA_TOPICS);
  }
}
