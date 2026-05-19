import { Injectable } from '@nestjs/common';
import {
  EXAMPLE_TOPICS,
  ExampleMessageCreatedEvent,
  ExampleMessageProcessedEvent,
} from '@kafka-base-implementation/components/example-messaging';
import { KafkaService } from '@kafka-base-implementation/core/kafka';

@Injectable()
export class AppService {
  private readonly receivedMessages: ExampleMessageCreatedEvent[] = [];

  constructor(private readonly kafkaService: KafkaService) {}

  getData() {
    return {
      service: 'consumer-api',
      consumes: EXAMPLE_TOPICS.MESSAGE_CREATED,
      publishes: EXAMPLE_TOPICS.MESSAGE_PROCESSED,
      receivedMessages: 'GET /api/received',
    };
  }

  async processMessage(
    event: ExampleMessageCreatedEvent,
  ): Promise<ExampleMessageProcessedEvent> {
    this.receivedMessages.unshift(event);

    const processedEvent: ExampleMessageProcessedEvent = {
      ...event,
      processedBy: 'consumer-api',
      processedAt: new Date().toISOString(),
      result: event.text.toUpperCase(),
    };

    await this.kafkaService.emit(
      EXAMPLE_TOPICS.MESSAGE_PROCESSED,
      processedEvent,
    );

    return processedEvent;
  }

  getReceivedMessages(): ExampleMessageCreatedEvent[] {
    return this.receivedMessages;
  }
}
