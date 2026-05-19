import { KafkaModuleOptions } from '../kafka';
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
  config: Required<KafkaModuleOptions> | undefined,
  options: MessagingInfrastructureModuleOptions,
): KafkaModuleOptions {
  return {
    brokers: options.brokers ?? config?.brokers,
    clientId: options.clientId ?? config?.clientId,
    groupId: options.groupId ?? config?.groupId,
  };
}
