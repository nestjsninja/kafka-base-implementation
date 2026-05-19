import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExampleMessagingModule } from '@kafka-base-implementation/components/example-messaging';
import { AppController } from './app.controller';
import { ConsumerApiConfig } from './app.config';
import { AppKafkaController } from './app.kafka-controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
      load: [ConsumerApiConfig],
    }),
    ExampleMessagingModule.register(),
  ],
  controllers: [AppController, AppKafkaController],
  providers: [AppService],
})
export class AppModule { }
