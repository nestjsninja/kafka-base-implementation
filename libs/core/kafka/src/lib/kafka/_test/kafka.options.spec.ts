import { Transport } from '@nestjs/microservices';
import {
  createKafkaTransportOptions,
  createKafkaMicroserviceOptions,
  normalizeKafkaOptions,
  parseKafkaBrokers,
} from '../kafka.options';

describe('kafka options', () => {
  it('parses comma-separated brokers and removes empty values', () => {
    expect(parseKafkaBrokers('localhost:9094, kafka:9092, ,')).toEqual([
      'localhost:9094',
      'kafka:9092',
    ]);
  });

  it('returns the local default broker when no broker is configured', () => {
    expect(parseKafkaBrokers()).toEqual(['localhost:9094']);
  });

  it('normalizes explicit options before falling back to local defaults', () => {
    expect(
      normalizeKafkaOptions({
        brokers: ['explicit-broker:9092'],
        clientId: 'explicit-client',
        groupId: 'explicit-group',
      }),
    ).toEqual({
      brokers: ['explicit-broker:9092'],
      clientId: 'explicit-client',
      groupId: 'explicit-group',
    });
  });

  it('normalizes options from nested Nest Kafka client and consumer config', () => {
    expect(
      normalizeKafkaOptions({
        client: {
          brokers: ['nested-broker:9092'],
          clientId: 'nested-client',
        },
        consumer: {
          groupId: 'nested-group',
        },
      }),
    ).toMatchObject({
      brokers: ['nested-broker:9092'],
      clientId: 'nested-client',
      groupId: 'nested-group',
    });
  });

  it('normalizes missing options with local defaults', () => {
    expect(normalizeKafkaOptions()).toEqual({
      brokers: ['localhost:9094'],
      clientId: 'nestjs-app',
      groupId: 'nestjs-app-group',
    });
  });

  it('creates Nest Kafka microservice transport options', () => {
    const kafkaOptions = createKafkaMicroserviceOptions({
      brokers: ['localhost:9094'],
      clientId: 'producer-api-client',
      groupId: 'producer-api-group',
    });

    expect(kafkaOptions).toEqual({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'producer-api-client',
          brokers: ['localhost:9094'],
        },
        consumer: {
          groupId: 'producer-api-group',
        },
      },
    });
    expect(kafkaOptions.options).not.toHaveProperty('postfixId');
  });

  it('passes through advanced Nest Kafka transport options', () => {
    expect(
      createKafkaTransportOptions({
        brokers: ['localhost:9094'],
        clientId: 'producer-api-client',
        groupId: 'producer-api-group',
        producerOnlyMode: true,
        postfixId: '-custom',
        subscribe: {
          fromBeginning: true,
        },
        run: {
          autoCommit: false,
        },
        producer: {
          allowAutoTopicCreation: false,
        },
        send: {
          acks: -1,
        },
      }),
    ).toEqual({
      client: {
        clientId: 'producer-api-client',
        brokers: ['localhost:9094'],
      },
      consumer: {
        groupId: 'producer-api-group',
      },
      producerOnlyMode: true,
      postfixId: '-custom',
      subscribe: {
        fromBeginning: true,
      },
      run: {
        autoCommit: false,
      },
      producer: {
        allowAutoTopicCreation: false,
      },
      send: {
        acks: -1,
      },
    });
  });
});
