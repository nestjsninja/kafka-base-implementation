import { ITopicConfig } from 'kafkajs';
import { EXAMPLE_TOPICS } from './example-topic.constants';

export const EXAMPLE_KAFKA_TOPICS: ITopicConfig[] = [
  {
    topic: EXAMPLE_TOPICS.MESSAGE_CREATED,
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
      {
        name: 'cleanup.policy',
        value: 'delete',
      },
      {
        name: 'retention.ms',
        value: '86400000',
      },
    ],
  },
  {
    topic: EXAMPLE_TOPICS.MESSAGE_PROCESSED,
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
      {
        name: 'cleanup.policy',
        value: 'delete',
      },
      {
        name: 'retention.ms',
        value: '86400000',
      },
    ],
  },
];
