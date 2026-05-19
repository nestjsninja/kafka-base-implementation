import { ITopicConfig } from 'kafkajs';
import { KafkaModuleOptions } from '../kafka';

export interface MessagingInfrastructureModuleOptions
  extends KafkaModuleOptions {
  topics?: ITopicConfig[];
  ensureTopics?: boolean;
}

export interface MessagingTopicProvisionerOptions {
  topics: ITopicConfig[];
  ensureTopics: boolean;
}
