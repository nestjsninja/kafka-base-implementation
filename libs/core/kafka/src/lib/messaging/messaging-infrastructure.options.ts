import { KafkaModuleOptions, NormalizedKafkaModuleOptions } from '../kafka';
import {
  MessagingInfrastructureModuleOptions,
  MessagingTopicProvisionerOptions,
} from './messaging-infrastructure.interfaces';

export function normalizeMessagingInfrastructureOptions(
  options: MessagingInfrastructureModuleOptions,
): MessagingTopicProvisionerOptions {
  return {
    topics: options.topics ?? [],
    ensureTopics: options.ensureTopics ?? true,
  };
}

export function resolveKafkaOptions(
  config: NormalizedKafkaModuleOptions | undefined,
  options: MessagingInfrastructureModuleOptions,
): KafkaModuleOptions {
  return {
    ...options,
    brokers: options.brokers ?? config?.brokers,
    clientId: options.clientId ?? config?.clientId,
    groupId: options.groupId ?? config?.groupId,
    client: options.client ?? config?.client,
    consumer: options.consumer ?? config?.consumer,
  };
}
