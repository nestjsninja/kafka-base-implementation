import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ExampleMessagingModule } from '@kafka-base-implementation/components/example-messaging';
import {
  KafkaConfig,
  KafkaModule,
  KafkaModuleOptions,
} from '@kafka-base-implementation/core/kafka';
import { AppController } from './app.controller';
import { ConsumerApiConfig, ConsumerApiConfigOptions } from './app.config';
import { AppKafkaController } from './app.kafka-controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
      load: [KafkaConfig, ConsumerApiConfig],
    }),
    KafkaModule.registerAsync({
      inject: [KafkaConfig.KEY, ConsumerApiConfig.KEY],
      useFactory: (
        kafkaConfig: ConfigType<typeof KafkaConfig>,
        consumerApiConfig: ConsumerApiConfigOptions,
      ): KafkaModuleOptions => ({
        brokers: kafkaConfig.brokers,
        clientId: consumerApiConfig.kafkaClientId,
        groupId: consumerApiConfig.kafkaGroupId,
      }),
    }),
    ExampleMessagingModule.forRoot({
      ensureTopics: true,
    }),
  ],
  controllers: [AppController, AppKafkaController],
  providers: [AppService],
})
export class AppModule {}
