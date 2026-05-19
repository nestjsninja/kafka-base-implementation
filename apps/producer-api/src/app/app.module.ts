import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ExampleMessagingModule } from '@kafka-base-implementation/components/example-messaging';
import {
  KafkaConfig,
  KafkaModule,
  KafkaModuleOptions,
} from '@kafka-base-implementation/core/kafka';
import { AppController } from './app.controller';
import { ProducerApiConfig, ProducerApiConfigOptions } from './app.config';
import { AppKafkaController } from './app.kafka-controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
      load: [KafkaConfig, ProducerApiConfig],
    }),
    KafkaModule.registerAsync({
      inject: [KafkaConfig.KEY, ProducerApiConfig.KEY],
      useFactory: (
        kafkaConfig: ConfigType<typeof KafkaConfig>,
        producerApiConfig: ProducerApiConfigOptions,
      ): KafkaModuleOptions => ({
        brokers: kafkaConfig.brokers,
        clientId: producerApiConfig.kafkaClientId,
        groupId: producerApiConfig.kafkaGroupId,
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
