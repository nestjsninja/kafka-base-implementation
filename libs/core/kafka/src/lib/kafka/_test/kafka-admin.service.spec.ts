import { Kafka } from 'kafkajs';
import { KafkaAdminService } from '../kafka-admin.service';

jest.mock('kafkajs', () => ({
  Kafka: jest.fn(),
}));

describe('KafkaAdminService', () => {
  const connect = jest.fn();
  const createTopics = jest.fn();
  const disconnect = jest.fn();
  const listTopics = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Kafka as jest.Mock).mockImplementation(() => ({
      admin: () => ({
        connect,
        createTopics,
        disconnect,
        listTopics,
      }),
    }));
  });

  it('creates topics with the configured brokers and admin client id', async () => {
    listTopics.mockResolvedValue([]);
    createTopics.mockResolvedValue(true);
    const service = new KafkaAdminService({
      brokers: ['localhost:9094'],
      clientId: 'producer-api-client',
      groupId: 'producer-api-group',
    });
    const topics = [
      {
        topic: 'example.message.created',
        numPartitions: 3,
        replicationFactor: 1,
      },
    ];

    await expect(service.ensureTopics(topics)).resolves.toBe(true);

    expect(Kafka).toHaveBeenCalledWith({
      brokers: ['localhost:9094'],
      clientId: 'producer-api-client-admin',
    });
    expect(connect).toHaveBeenCalledTimes(1);
    expect(listTopics).toHaveBeenCalledTimes(1);
    expect(createTopics).toHaveBeenCalledWith({
      waitForLeaders: true,
      topics,
    });
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not connect when no topics are provided', async () => {
    const service = new KafkaAdminService({
      brokers: ['localhost:9094'],
      clientId: 'producer-api-client',
      groupId: 'producer-api-group',
    });

    await expect(service.ensureTopics([])).resolves.toBe(false);

    expect(Kafka).not.toHaveBeenCalled();
    expect(connect).not.toHaveBeenCalled();
  });

  it('does not create topics that already exist', async () => {
    listTopics.mockResolvedValue(['example.message.created']);
    const service = new KafkaAdminService({
      brokers: ['localhost:9094'],
      clientId: 'producer-api-client',
      groupId: 'producer-api-group',
    });
    const topics = [
      {
        topic: 'example.message.created',
        numPartitions: 3,
        replicationFactor: 1,
      },
    ];

    await expect(service.ensureTopics(topics)).resolves.toBe(false);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(listTopics).toHaveBeenCalledTimes(1);
    expect(createTopics).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('only creates missing topics when some topics already exist', async () => {
    listTopics.mockResolvedValue(['example.message.created']);
    createTopics.mockResolvedValue(true);
    const service = new KafkaAdminService({
      brokers: ['localhost:9094'],
      clientId: 'producer-api-client',
      groupId: 'producer-api-group',
    });
    const existingTopic = {
      topic: 'example.message.created',
      numPartitions: 3,
      replicationFactor: 1,
    };
    const missingTopic = {
      topic: 'example.message.processed',
      numPartitions: 3,
      replicationFactor: 1,
    };

    await expect(
      service.ensureTopics([existingTopic, missingTopic]),
    ).resolves.toBe(true);

    expect(createTopics).toHaveBeenCalledWith({
      waitForLeaders: true,
      topics: [missingTopic],
    });
  });
});
