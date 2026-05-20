import { KafkaOptions } from '@nestjs/microservices';

export type KafkaTransportOptions = NonNullable<KafkaOptions['options']>;

type KafkaTransportOptionKeys =
  | 'client'
  | 'consumer'
  | 'run'
  | 'subscribe'
  | 'producer'
  | 'send'
  | 'serializer'
  | 'deserializer'
  | 'parser'
  | 'producerOnlyMode'
  | 'postfixId';

export interface KafkaModuleOptions
  extends Pick<KafkaTransportOptions, KafkaTransportOptionKeys> {
  brokers?: string[];
  clientId?: string;
  groupId?: string;
}

export interface KafkaMicroserviceOptions extends KafkaModuleOptions {
  groupId: string;
}

export interface NormalizedKafkaModuleOptions extends KafkaModuleOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
}
