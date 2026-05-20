import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Consumer, Producer, TopicPartitionOffsetAndMetadata } from 'kafkajs';
import { lastValueFrom, Observable } from 'rxjs';
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

  emit$<TResult = unknown, TPayload = unknown>(
    topic: string,
    payload: TPayload,
  ): Observable<TResult> {
    return this.client.emit<TResult, TPayload>(topic, payload);
  }

  async emitBatch<TPayload>(
    topic: string,
    messages: TPayload[],
  ): Promise<void> {
    this.logger.log(
      `Emitting Kafka batch with ${messages.length} message(s) to topic "${topic}"`,
    );
    await lastValueFrom(this.client.emitBatch(topic, { messages }));
    this.logger.log(`Kafka batch emitted to topic "${topic}"`);
  }

  send<TResult = unknown, TPayload = unknown>(
    pattern: string,
    payload: TPayload,
  ): Observable<TResult> {
    this.logger.log(`Sending Kafka request to pattern "${pattern}"`);
    return this.client.send<TResult, TPayload>(pattern, payload);
  }

  async request<TResult = unknown, TPayload = unknown>(
    pattern: string,
    payload: TPayload,
  ): Promise<TResult> {
    return lastValueFrom(this.send<TResult, TPayload>(pattern, payload));
  }

  subscribeToResponseOf(pattern: string): void {
    this.logger.log(`Subscribing Kafka client to response pattern "${pattern}"`);
    this.client.subscribeToResponseOf(pattern);
  }

  async commitOffsets(
    topicPartitions: TopicPartitionOffsetAndMetadata[],
  ): Promise<void> {
    this.logger.log(
      `Committing Kafka offsets for ${topicPartitions.length} topic partition(s)`,
    );
    await this.client.commitOffsets(topicPartitions);
  }

  getClient(): ClientKafka {
    return this.client;
  }

  getConsumer(): Consumer | null {
    return this.client.consumer;
  }

  getProducer(): Producer | null {
    return this.client.producer;
  }

  unwrap<T = unknown>(): T {
    return this.client.unwrap<T>();
  }
}
