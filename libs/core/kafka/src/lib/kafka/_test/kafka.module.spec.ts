import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { KafkaAdminService } from '../kafka-admin.service';
import { KAFKA_CLIENT } from '../kafka.tokens';
import { KafkaModule } from '../kafka.module';
import { KafkaService } from '../kafka.service';

describe('KafkaModule', () => {
  it('registers KafkaService with static options', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        KafkaModule.register({
          brokers: ['localhost:9094'],
          clientId: 'test-client',
          groupId: 'test-group',
        }),
      ],
    })
      .overrideProvider(KAFKA_CLIENT)
      .useValue({
        close: jest.fn(),
        connect: jest.fn(),
        emit: jest.fn(),
      })
      .compile();

    expect(moduleRef.get(KafkaService)).toBeInstanceOf(KafkaService);
    expect(moduleRef.get(KafkaAdminService)).toBeInstanceOf(KafkaAdminService);
  });

  it('builds a dynamic module with async options', () => {
    const dynamicModule = KafkaModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        brokers: [configService.get<string>('KAFKA_BROKERS', 'localhost:9094')],
        clientId: 'async-client',
        groupId: 'async-group',
      }),
    });

    expect(dynamicModule.module).toBe(KafkaModule);
    expect(dynamicModule.imports).toEqual(
      expect.arrayContaining([ConfigModule]),
    );
    expect(dynamicModule.providers).toContain(KafkaService);
    expect(dynamicModule.providers).toContain(KafkaAdminService);
    expect(dynamicModule.exports).toContain(KafkaService);
    expect(dynamicModule.exports).toContain(KafkaAdminService);
  });
});
