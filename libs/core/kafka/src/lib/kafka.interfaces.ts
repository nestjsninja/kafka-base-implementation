import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export interface KafkaModuleOptions {
  brokers?: string[];
  clientId?: string;
  groupId?: string;
}

export interface KafkaMicroserviceOptions extends KafkaModuleOptions {
  groupId: string;
}

export interface KafkaModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: FactoryProvider['inject'];
  useFactory: FactoryProvider<KafkaModuleOptions>['useFactory'];
}
