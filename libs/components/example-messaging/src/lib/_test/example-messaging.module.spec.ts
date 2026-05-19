import { MessagingInfrastructureModule } from '@kafka-base-implementation/core/kafka';
import { ExampleMessagingModule } from '../example-messaging.module';
import { ExampleMessagingService } from '../example-messaging.service';

describe('ExampleMessagingModule', () => {
    it('builds a dynamic module with explicit topic creation options', () => {
        const dynamicModule = ExampleMessagingModule.register({
            ensureTopics: true,
        });

        expect(dynamicModule.module).toBe(ExampleMessagingModule);
        expect(dynamicModule.imports).toHaveLength(1);
        expect(dynamicModule.imports?.[0]).toEqual(
            expect.objectContaining({
                module: MessagingInfrastructureModule,
            }),
        );
        expect(dynamicModule.providers).toEqual([ExampleMessagingService]);
    });

    it('defaults ensureTopics to true when no options are passed', () => {
        const dynamicModule = ExampleMessagingModule.register();

        expect(dynamicModule.providers).toEqual([ExampleMessagingService]);
    });
});
