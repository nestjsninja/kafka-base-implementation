export interface KafkaModuleOptions {
  brokers?: string[];
  clientId?: string;
  groupId?: string;
}

export interface KafkaMicroserviceOptions extends KafkaModuleOptions {
  groupId: string;
}
