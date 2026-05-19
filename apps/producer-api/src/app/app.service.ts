import { Injectable } from '@nestjs/common';
import {
  EXAMPLE_TOPICS,
  ExampleMessageCreatedEvent,
  ExampleMessageProcessedEvent,
} from '@kafka-base-implementation/components/example-messaging';
import { KafkaService } from '@kafka-base-implementation/core/kafka';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AppService {
  private readonly processedMessages: ExampleMessageProcessedEvent[] = [];

  constructor(private readonly kafkaService: KafkaService) {}

  getData() {
    return {
      service: 'producer-api',
      publishExample: 'POST /api/messages with {"text":"hello from producer"}',
      processedMessages: 'GET /api/processed',
    };
  }

  async publishMessage(text = 'hello from producer') {
    const event: ExampleMessageCreatedEvent = {
      id: randomUUID(),
      text,
      source: 'producer-api',
      createdAt: new Date().toISOString(),
    };

    await this.kafkaService.emit(EXAMPLE_TOPICS.MESSAGE_CREATED, event);

    return {
      topic: EXAMPLE_TOPICS.MESSAGE_CREATED,
      event,
    };
  }

  recordProcessedMessage(event: ExampleMessageProcessedEvent): void {
    this.processedMessages.unshift(event);
  }

  getProcessedMessages(): ExampleMessageProcessedEvent[] {
    return this.processedMessages;
  }
}
