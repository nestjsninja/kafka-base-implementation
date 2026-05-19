import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  KafkaConfig,
  createKafkaMicroserviceOptions,
} from '@kafka-base-implementation/core/kafka';
import { ProducerApiConfig } from './app/app.config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const kafkaConfig = app.get<ConfigType<typeof KafkaConfig>>(KafkaConfig.KEY);
  const producerApiConfig = app.get<ConfigType<typeof ProducerApiConfig>>(
    ProducerApiConfig.KEY,
  );

  app.connectMicroservice(
    createKafkaMicroserviceOptions({
      brokers: kafkaConfig.brokers,
      clientId: producerApiConfig.kafkaClientId,
      groupId: producerApiConfig.kafkaGroupId,
    }),
  );

  const globalPrefix = 'api';
  app.enableCors();
  app.setGlobalPrefix(globalPrefix);
  const port = producerApiConfig.port;
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(
    `Producer API is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
