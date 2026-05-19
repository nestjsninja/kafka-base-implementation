import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '@kafka-base-implementation/core/kafka';
import {
  ExampleMessageCreatedEvent,
  ExampleMessageProcessedEvent,
} from './example-event.interfaces';
import { EXAMPLE_TOPICS } from './example-topic.constants';

@Injectable()
export class ExampleMessagingService {
  private readonly logger = new Logger(ExampleMessagingService.name);

  constructor(private readonly kafkaService: KafkaService) { }

  async emitMessageCreated(event: ExampleMessageCreatedEvent): Promise<void> {
    this.logger.log(`Publishing message-created event "${event.id}"`);
    await this.kafkaService.emit(EXAMPLE_TOPICS.MESSAGE_CREATED, event);
  }

  async emitMessageProcessed(
    event: ExampleMessageProcessedEvent,
  ): Promise<void> {
    this.logger.log(`Publishing message-processed event "${event.id}"`);
    await this.kafkaService.emit(EXAMPLE_TOPICS.MESSAGE_PROCESSED, event);
  }
}
