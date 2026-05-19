import { KafkaOptions, Transport } from '@nestjs/microservices';
import {
  DEFAULT_KAFKA_BROKERS,
  DEFAULT_KAFKA_CLIENT_ID,
  DEFAULT_KAFKA_GROUP_ID,
} from './kafka.constants';
import {
  KafkaMicroserviceOptions,
  KafkaModuleOptions,
} from './kafka.interfaces';

export function parseKafkaBrokers(value?: string): string[] {
  const brokers = value
    ?.split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

  return brokers?.length ? brokers : DEFAULT_KAFKA_BROKERS;
}

export function normalizeKafkaOptions(
  options: KafkaModuleOptions = {},
): Required<KafkaModuleOptions> {
  return {
    brokers: options.brokers ?? DEFAULT_KAFKA_BROKERS,
    clientId: options.clientId ?? DEFAULT_KAFKA_CLIENT_ID,
    groupId: options.groupId ?? DEFAULT_KAFKA_GROUP_ID,
  };
}

export function createKafkaMicroserviceOptions(
  options: KafkaMicroserviceOptions,
): KafkaOptions {
  const kafkaOptions = normalizeKafkaOptions(options);

  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: kafkaOptions.clientId,
        brokers: kafkaOptions.brokers,
      },
      consumer: {
        groupId: kafkaOptions.groupId,
      },
    },
  };
}
