import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT, KAFKA_MODULE_OPTIONS } from './kafka.tokens';
import {
  KafkaModuleAsyncOptions,
  KafkaModuleOptions,
} from './kafka.interfaces';
import { normalizeKafkaOptions } from './kafka.options';
import { KafkaAdminService } from './kafka-admin.service';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  controllers: [],
})
export class KafkaModule {
  static register(options: KafkaModuleOptions = {}): DynamicModule {
    const kafkaOptions = normalizeKafkaOptions(options);

    return {
      module: KafkaModule,
      imports: [
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

  static registerAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [
        ...(options.imports ?? []),
        ClientsModule.registerAsync([
          {
            name: KAFKA_CLIENT,
            imports: options.imports,
            inject: options.inject,
            useFactory: async (...args) => {
              const kafkaOptions = normalizeKafkaOptions(
                await options.useFactory(...args),
              );

              return {
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
              };
            },
          },
        ]),
      ],
      providers: [
        KafkaAdminService,
        {
          provide: KAFKA_MODULE_OPTIONS,
          inject: options.inject,
          useFactory: async (...args) =>
            normalizeKafkaOptions(await options.useFactory(...args)),
        },
        KafkaService,
      ],
      exports: [KafkaAdminService, KafkaService],
    };
  }
}
