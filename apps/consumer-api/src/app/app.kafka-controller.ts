import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  EXAMPLE_TOPICS,
  ExampleMessageCreatedEvent,
} from '@kafka-base-implementation/components/example-messaging';
import { AppService } from './app.service';

@Controller()
export class AppKafkaController {
  constructor(private readonly appService: AppService) {}

  @EventPattern(EXAMPLE_TOPICS.MESSAGE_CREATED)
  async handleMessageCreated(@Payload() event: ExampleMessageCreatedEvent) {
    await this.appService.processMessage(event);
  }
}
