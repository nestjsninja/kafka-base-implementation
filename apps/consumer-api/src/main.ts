import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  KafkaConfig,
  createKafkaMicroserviceOptions,
  suppressKafkaJsTimeoutNegativeWarning,
} from '@kafka-base-implementation/core/kafka';
import { ConsumerApiConfig } from './app/app.config';
import { AppModule } from './app/app.module';

suppressKafkaJsTimeoutNegativeWarning();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const kafkaConfig = app.get<ConfigType<typeof KafkaConfig>>(KafkaConfig.KEY);
  const consumerApiConfig = app.get<ConfigType<typeof ConsumerApiConfig>>(
    ConsumerApiConfig.KEY,
  );

  app.connectMicroservice(
    createKafkaMicroserviceOptions({
      brokers: kafkaConfig.brokers,
      clientId: consumerApiConfig.kafkaClientId,
      groupId: consumerApiConfig.kafkaGroupId,
    }),
  );

  const globalPrefix = 'api';
  app.enableCors();
  app.setGlobalPrefix(globalPrefix);
  const port = consumerApiConfig.port;
  await app.init();
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(
    `Consumer API is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
