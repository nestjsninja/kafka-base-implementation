import { KafkaAdminService } from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingModule } from './example-messaging.module';
import { EXAMPLE_MESSAGING_MODULE_OPTIONS } from './example-messaging.tokens';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

describe('ExampleMessagingModule', () => {
  it('builds a dynamic module with explicit topic creation options', () => {
    const dynamicModule = ExampleMessagingModule.forRoot({
      ensureTopics: true,
    });

    expect(dynamicModule.module).toBe(ExampleMessagingModule);
    expect(dynamicModule.providers).toEqual([
      {
        provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
        useValue: {
          ensureTopics: true,
        },
      },
    ]);
  });

  it('ensures the example Kafka topics exist on module initialization', async () => {
    const kafkaAdminService = {
      ensureTopics: jest.fn().mockResolvedValue(true),
    };
    const module = new ExampleMessagingModule(
      kafkaAdminService as unknown as KafkaAdminService,
      {
        ensureTopics: true,
      },
    );

    await module.onModuleInit();

    expect(kafkaAdminService.ensureTopics).toHaveBeenCalledWith(
      EXAMPLE_KAFKA_TOPICS,
    );
  });

  it('does not ensure topics when topic creation is disabled', async () => {
    const kafkaAdminService = {
      ensureTopics: jest.fn().mockResolvedValue(true),
    };
    const module = new ExampleMessagingModule(
      kafkaAdminService as unknown as KafkaAdminService,
      {
        ensureTopics: false,
      },
    );

    await module.onModuleInit();

    expect(kafkaAdminService.ensureTopics).not.toHaveBeenCalled();
  });
});
