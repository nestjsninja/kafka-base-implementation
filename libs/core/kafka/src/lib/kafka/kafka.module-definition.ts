import { ConfigurableModuleBuilder } from '@nestjs/common';
import { KafkaModuleOptions } from './kafka.interfaces';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: KAFKA_MODULE_OPTIONS,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<KafkaModuleOptions>()
  .setClassMethodName('register')
  .build();
