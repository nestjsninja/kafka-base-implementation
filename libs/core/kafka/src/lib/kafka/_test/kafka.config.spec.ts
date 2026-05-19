import { KafkaConfig } from '../kafka.config';

describe('KafkaConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['KAFKA_BROKERS'];
    delete process.env['KAFKA_CLIENT_ID'];
    delete process.env['KAFKA_GROUP_ID'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads kafka config from environment variables', () => {
    process.env['KAFKA_BROKERS'] = 'broker-a:9092,broker-b:9092';
    process.env['KAFKA_CLIENT_ID'] = 'env-client';
    process.env['KAFKA_GROUP_ID'] = 'env-group';

    expect(KafkaConfig()).toEqual({
      brokers: ['broker-a:9092', 'broker-b:9092'],
      clientId: 'env-client',
      groupId: 'env-group',
    });
  });

  it('uses local defaults when environment variables are not set', () => {
    expect(KafkaConfig()).toEqual({
      brokers: ['localhost:9094'],
      clientId: 'nestjs-app',
      groupId: 'nestjs-app-group',
    });
  });
});
