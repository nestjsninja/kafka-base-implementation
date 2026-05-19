import { registerAs } from '@nestjs/config';
import { Env } from '@kafka-base-implementation/core/env';
import {
  DEFAULT_KAFKA_CLIENT_ID,
  DEFAULT_KAFKA_GROUP_ID,
} from './kafka.constants';
import { KafkaModuleOptions } from './kafka.interfaces';
import { parseKafkaBrokers } from './kafka.options';

export const KafkaConfig = registerAs(
  'kafkaModuleConfig',
  (): Required<KafkaModuleOptions> => {
    return {
      brokers: parseKafkaBrokers(Env.getValue('KAFKA_BROKERS')),
      clientId: Env.getValue('KAFKA_CLIENT_ID', DEFAULT_KAFKA_CLIENT_ID),
      groupId: Env.getValue('KAFKA_GROUP_ID', DEFAULT_KAFKA_GROUP_ID),
    };
  },
);
