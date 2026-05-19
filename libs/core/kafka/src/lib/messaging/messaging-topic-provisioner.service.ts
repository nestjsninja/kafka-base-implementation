import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaAdminService } from '../kafka';
import { MessagingTopicProvisionerOptions } from './messaging-infrastructure.interfaces';
import { MESSAGING_INFRASTRUCTURE_MODULE_OPTIONS } from './messaging-infrastructure.tokens';

@Injectable()
export class MessagingTopicProvisionerService implements OnModuleInit {
  private readonly logger = new Logger(MessagingTopicProvisionerService.name);

  constructor(
    private readonly kafkaAdminService: KafkaAdminService,
    @Inject(MESSAGING_INFRASTRUCTURE_MODULE_OPTIONS)
    private readonly options: MessagingTopicProvisionerOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.options.ensureTopics) {
      this.logger.log('Kafka topic provisioning is disabled for this messaging module');
      return;
    }

    if (this.options.topics.length === 0) {
      this.logger.log('Kafka topic provisioning skipped because no topics were configured');
      return;
    }

    this.logger.log(
      `Ensuring ${this.options.topics.length} Kafka topic(s): ${this.options.topics
        .map(({ topic }) => topic)
        .join(', ')}`,
    );

    await this.kafkaAdminService.ensureTopics(this.options.topics);

    this.logger.log('Kafka topic provisioning completed');
  }
}
