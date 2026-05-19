import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  EXAMPLE_TOPICS,
  ExampleMessageProcessedEvent,
} from '@kafka-base-implementation/components/example-messaging';
import { AppService } from './app.service';

@Controller()
export class AppKafkaController {
  constructor(private readonly appService: AppService) {}

  @EventPattern(EXAMPLE_TOPICS.MESSAGE_PROCESSED)
  handleProcessedMessage(@Payload() event: ExampleMessageProcessedEvent) {
    this.appService.recordProcessedMessage(event);
  }
}
