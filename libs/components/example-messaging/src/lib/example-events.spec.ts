import {
  ExampleMessageCreatedEvent,
  ExampleMessageProcessedEvent,
} from './example-event.interfaces';
import { EXAMPLE_TOPICS } from './example-topic.constants';
import { EXAMPLE_KAFKA_TOPICS } from './example-topics';

describe('example message contracts', () => {
  it('defines stable topic names for the producer and consumer apps', () => {
    expect(EXAMPLE_TOPICS).toEqual({
      MESSAGE_CREATED: 'example.message.created',
      MESSAGE_PROCESSED: 'example.message.processed',
    });
  });

  it('defines explicit Kafka topic creation configs', () => {
    expect(EXAMPLE_KAFKA_TOPICS).toEqual([
      expect.objectContaining({
        topic: EXAMPLE_TOPICS.MESSAGE_CREATED,
        numPartitions: 3,
        replicationFactor: 1,
      }),
      expect.objectContaining({
        topic: EXAMPLE_TOPICS.MESSAGE_PROCESSED,
        numPartitions: 3,
        replicationFactor: 1,
      }),
    ]);
  });

  it('supports the message-created event payload shape', () => {
    const event: ExampleMessageCreatedEvent = {
      id: 'message-id',
      text: 'hello kafka',
      source: 'producer-api',
      createdAt: '2026-05-19T00:00:00.000Z',
    };

    expect(event).toMatchObject({
      id: 'message-id',
      text: 'hello kafka',
      source: 'producer-api',
    });
  });

  it('supports the message-processed event payload shape', () => {
    const event: ExampleMessageProcessedEvent = {
      id: 'message-id',
      text: 'hello kafka',
      source: 'producer-api',
      createdAt: '2026-05-19T00:00:00.000Z',
      processedBy: 'consumer-api',
      processedAt: '2026-05-19T00:00:01.000Z',
      result: 'HELLO KAFKA',
    };

    expect(event.result).toBe('HELLO KAFKA');
    expect(event.processedBy).toBe('consumer-api');
  });
});
