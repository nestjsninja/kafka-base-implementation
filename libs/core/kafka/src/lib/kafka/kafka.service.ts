import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { KAFKA_CLIENT } from './kafka.tokens';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  constructor(@Inject(KAFKA_CLIENT) private readonly client: ClientKafka) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting Kafka client');
    await this.client.connect();
    this.logger.log('Kafka client connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing Kafka client');
    await this.client.close();
    this.logger.log('Kafka client closed');
  }

  async emit<TPayload>(topic: string, payload: TPayload): Promise<void> {
    this.logger.log(`Emitting Kafka message to topic "${topic}"`);
    await lastValueFrom(this.client.emit(topic, payload));
    this.logger.log(`Kafka message emitted to topic "${topic}"`);
  }
}
