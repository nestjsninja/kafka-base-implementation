import { registerAs } from '@nestjs/config';
import { Env } from '@kafka-base-implementation/core/env';

const DEFAULT_BROKERS = ['localhost:9094'];
const DEFAULT_CLIENT_ID = 'nestjs-app';
const DEFAULT_GROUP_ID = 'nestjs-app-group';

export const ExampleMessagingConfig = registerAs(
  'exampleMessagingConfig',
  () => {
    const raw = Env.getValue('KAFKA_BROKERS');
    const brokers = raw
      ? raw
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)
      : DEFAULT_BROKERS;

    return {
      brokers,
      clientId: Env.getValue('KAFKA_CLIENT_ID', DEFAULT_CLIENT_ID),
      groupId: Env.getValue('KAFKA_GROUP_ID', DEFAULT_GROUP_ID),
    };
  },
);
