import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  KafkaConfig,
  KafkaModule,
  KafkaAdminService,
} from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingModuleOptions } from './example-messaging.interfaces';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  EXAMPLE_MESSAGING_MODULE_OPTIONS,
  OPTIONS_TYPE,
} from './example-messaging.module-definition';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

@Module({})
export class ExampleMessagingModule
  extends ConfigurableModuleClass
  implements OnModuleInit {
  static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
    return {
      module: ExampleMessagingModule,
      imports: [
        KafkaModule.registerAsync({
          inject: [KafkaConfig.KEY],
          useFactory: (kafkaConfig: ConfigType<typeof KafkaConfig>) => ({
            brokers: kafkaConfig.brokers,
            clientId: kafkaConfig.clientId,
            groupId: kafkaConfig.groupId,
          }),
        }),
      ],
      providers: [
        {
          provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
          useValue: { ensureTopics: options.ensureTopics ?? false },
        },
      ],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: ExampleMessagingModule,
      imports: [
        ...(options.imports ?? []),
        KafkaModule.registerAsync({
          inject: [KafkaConfig.KEY],
          useFactory: (kafkaConfig: ConfigType<typeof KafkaConfig>) => ({
            brokers: kafkaConfig.brokers,
            clientId: kafkaConfig.clientId,
            groupId: kafkaConfig.groupId,
          }),
        }),
      ],
      providers: [
        {
          provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: async (...args) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const opts = await options.useFactory!(...args);
            return { ensureTopics: opts.ensureTopics ?? false };
          },
        },
      ],
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
