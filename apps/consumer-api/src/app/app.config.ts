import { registerAs } from '@nestjs/config';
import { Env } from '@kafka-base-implementation/core/env';

export interface ConsumerApiConfigOptions {
  port: number;
  kafkaClientId: string;
  kafkaGroupId: string;
}

export const ConsumerApiConfig = registerAs(
  'consumerApiConfig',
  (): ConsumerApiConfigOptions => {
    return {
      port: Env.getIntValue('CONSUMER_API_PORT', 3001),
      kafkaClientId: Env.getValue(
        'CONSUMER_KAFKA_CLIENT_ID',
        'consumer-api-client',
      ),
      kafkaGroupId: Env.getValue(
        'CONSUMER_KAFKA_GROUP_ID',
        'consumer-api-group',
      ),
    };
  },
);
