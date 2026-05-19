import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { KafkaConfig, KafkaModule } from '../kafka';
import { MessagingInfrastructureModuleOptions } from './messaging-infrastructure.interfaces';
import {
  normalizeMessagingInfrastructureOptions,
  resolveKafkaOptions,
} from './messaging-infrastructure.options';
import { MESSAGING_INFRASTRUCTURE_MODULE_OPTIONS } from './messaging-infrastructure.tokens';
import { MessagingTopicProvisionerService } from './messaging-topic-provisioner.service';

@Module({})
export class MessagingInfrastructureModule {
  private static readonly logger = new Logger(MessagingInfrastructureModule.name);

  static register(
    options: MessagingInfrastructureModuleOptions = {},
  ): DynamicModule {
    const moduleOptions = normalizeMessagingInfrastructureOptions(options);

    this.logger.log(
      `Registering messaging infrastructure with ${moduleOptions.topics.length} topic(s); ensureTopics=${moduleOptions.ensureTopics}`,
    );

    return {
      module: MessagingInfrastructureModule,
      imports: [
        KafkaModule.registerAsync({
          ...KafkaConfig.asProvider(),
          useFactory: (config: ConfigType<typeof KafkaConfig>) =>
            resolveKafkaOptions(config, options),
        }),
      ],
      providers: [
        {
          provide: MESSAGING_INFRASTRUCTURE_MODULE_OPTIONS,
          useValue: moduleOptions,
        },
        MessagingTopicProvisionerService,
      ],
      exports: [KafkaModule],
    };
  }
}
