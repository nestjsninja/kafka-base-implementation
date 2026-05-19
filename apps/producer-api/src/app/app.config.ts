import { registerAs } from '@nestjs/config';
import { Env } from '@kafka-base-implementation/core/env';

export interface ProducerApiConfigOptions {
  port: number;
  kafkaClientId: string;
  kafkaGroupId: string;
}

export const ProducerApiConfig = registerAs(
  'producerApiConfig',
  (): ProducerApiConfigOptions => {
    return {
      port: Env.getIntValue('PRODUCER_API_PORT', 3000),
      kafkaClientId: Env.getValue(
        'PRODUCER_KAFKA_CLIENT_ID',
        'producer-api-client',
      ),
      kafkaGroupId: Env.getValue(
        'PRODUCER_KAFKA_GROUP_ID',
        'producer-api-group',
      ),
    };
  },
);
