import { KafkaOptions, Transport } from '@nestjs/microservices';
import {
  DEFAULT_KAFKA_BROKERS,
  DEFAULT_KAFKA_CLIENT_ID,
  DEFAULT_KAFKA_GROUP_ID,
} from './kafka.constants';
import {
  KafkaMicroserviceOptions,
  KafkaModuleOptions,
  KafkaTransportOptions,
  NormalizedKafkaModuleOptions,
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
): NormalizedKafkaModuleOptions {
  const brokers = options.brokers ?? getConfiguredBrokers(options);
  const clientId = options.clientId ?? options.client?.clientId;
  const groupId = options.groupId ?? options.consumer?.groupId;

  return {
    ...options,
    brokers: brokers ?? DEFAULT_KAFKA_BROKERS,
    clientId: clientId ?? DEFAULT_KAFKA_CLIENT_ID,
    groupId: groupId ?? DEFAULT_KAFKA_GROUP_ID,
  };
}

export function createKafkaTransportOptions(
  options: KafkaModuleOptions = {},
): KafkaTransportOptions {
  const kafkaOptions = normalizeKafkaOptions(options);

  return removeUndefinedProperties({
    client: {
      ...(kafkaOptions.client ?? {}),
      clientId: kafkaOptions.clientId,
      brokers: kafkaOptions.brokers,
    },
    consumer: {
      ...(kafkaOptions.consumer ?? {}),
      groupId: kafkaOptions.groupId,
    },
    run: kafkaOptions.run,
    subscribe: kafkaOptions.subscribe,
    producer: kafkaOptions.producer,
    send: kafkaOptions.send,
    serializer: kafkaOptions.serializer,
    deserializer: kafkaOptions.deserializer,
    parser: kafkaOptions.parser,
    producerOnlyMode: kafkaOptions.producerOnlyMode,
    postfixId: kafkaOptions.postfixId,
  });
}

export function createKafkaMicroserviceOptions(
  options: KafkaMicroserviceOptions,
): KafkaOptions {
  return {
    transport: Transport.KAFKA,
    options: createKafkaTransportOptions(options),
  };
}

function getConfiguredBrokers(
  options: KafkaModuleOptions,
): string[] | undefined {
  return Array.isArray(options.client?.brokers)
    ? options.client.brokers
    : undefined;
}

function removeUndefinedProperties<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, propertyValue]) => propertyValue !== undefined),
  ) as T;
}
