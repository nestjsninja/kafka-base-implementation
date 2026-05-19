import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT } from './kafka.tokens';
import { KafkaConfig } from './kafka.config';
import { KafkaModuleOptions } from './kafka.interfaces';
import { normalizeKafkaOptions } from './kafka.options';
import { KafkaAdminService } from './kafka-admin.service';
import { KafkaService } from './kafka.service';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  KAFKA_MODULE_OPTIONS,
  OPTIONS_TYPE,
} from './kafka.module-definition';

@Module({
  controllers: [],
})
export class KafkaModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
    const kafkaOptions = normalizeKafkaOptions(options);

    return {
      module: KafkaModule,
      imports: [
        ConfigModule.forFeature(KafkaConfig),
        ClientsModule.register([
          {
            name: KAFKA_CLIENT,
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: kafkaOptions.clientId,
                brokers: kafkaOptions.brokers,
              },
              consumer: {
                groupId: kafkaOptions.groupId,
              },
            },
          },
        ]),
      ],
      providers: [
        KafkaAdminService,
        KafkaService,
        {
          provide: KAFKA_MODULE_OPTIONS,
          useValue: kafkaOptions,
        },
      ],
      exports: [KafkaAdminService, KafkaService],
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const optionsProvider = {
      provide: KAFKA_MODULE_OPTIONS,
      inject: options.inject,
      useFactory: async (...args: Parameters<NonNullable<typeof options.useFactory>>) =>
        normalizeKafkaOptions(await options.useFactory?.(...args) ?? {}),
    };

    return {
      module: KafkaModule,
      imports: [
        ConfigModule.forFeature(KafkaConfig),
        ...(options.imports ?? []),
        ClientsModule.registerAsync([
          {
            name: KAFKA_CLIENT,
            imports: options.imports,
            inject: [KAFKA_MODULE_OPTIONS],
            extraProviders: [optionsProvider],
            useFactory: (kafkaOptions: Required<KafkaModuleOptions>) => ({
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: kafkaOptions.clientId,
                  brokers: kafkaOptions.brokers,
                },
                consumer: {
                  groupId: kafkaOptions.groupId,
                },
              },
            }),
          },
        ]),
      ],
      providers: [KafkaAdminService, optionsProvider, KafkaService],
      exports: [KafkaAdminService, KafkaService],
    };
  }
}
