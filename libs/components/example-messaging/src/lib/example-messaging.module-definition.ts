import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ExampleMessagingModuleOptions } from './example-messaging.interfaces';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: EXAMPLE_MESSAGING_MODULE_OPTIONS,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ExampleMessagingModuleOptions>()
  .setClassMethodName('register')
  .build();
