import { KafkaAdminService } from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingModule } from './example-messaging.module';
import { EXAMPLE_MESSAGING_MODULE_OPTIONS } from './example-messaging.module-definition';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

describe('ExampleMessagingModule', () => {
    it('builds a dynamic module with explicit topic creation options', () => {
        const dynamicModule = ExampleMessagingModule.register({
            ensureTopics: true,
        });

        expect(dynamicModule.global).toBe(true);
        expect(dynamicModule.module).toBe(ExampleMessagingModule);
        expect(dynamicModule.imports).toHaveLength(1);
        expect(dynamicModule.providers).toEqual([
            {
                provide: EXAMPLE_MESSAGING_MODULE_OPTIONS,
                useValue: {
                    ensureTopics: true,
                },
            },
        ]);
    });

    it('defaults ensureTopics to true when no options are passed', () => {
        const dynamicModule = ExampleMessagingModule.register();

        expect(dynamicModule.global).toBe(true);
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
