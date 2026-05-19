import {
  normalizeMessagingInfrastructureOptions,
  resolveKafkaOptions,
} from '../messaging-infrastructure.options';

const topics = [
  {
    topic: 'example.message.created',
    numPartitions: 3,
    replicationFactor: 1,
  },
];

describe('messaging infrastructure options', () => {
  it('normalizes topic provisioner options', () => {
    expect(
      normalizeMessagingInfrastructureOptions({
        topics,
      }),
    ).toEqual({
      topics,
      ensureTopics: true,
    });
  });

  it('resolves Kafka options from explicit options first', () => {
    expect(
      resolveKafkaOptions(
        {
          brokers: ['config:9092'],
          clientId: 'config-client',
          groupId: 'config-group',
        },
        {
          brokers: ['explicit:9092'],
          clientId: 'explicit-client',
          groupId: 'explicit-group',
        },
      ),
    ).toEqual({
      brokers: ['explicit:9092'],
      clientId: 'explicit-client',
      groupId: 'explicit-group',
    });
  });

  it('falls back to Kafka config when explicit options are omitted', () => {
    expect(
      resolveKafkaOptions(
        {
          brokers: ['config:9092'],
          clientId: 'config-client',
          groupId: 'config-group',
        },
        {},
      ),
    ).toEqual({
      brokers: ['config:9092'],
      clientId: 'config-client',
      groupId: 'config-group',
    });
  });
});
