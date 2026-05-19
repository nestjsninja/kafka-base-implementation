import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITopicConfig, Kafka } from 'kafkajs';
import { KafkaModuleOptions } from './kafka.interfaces';
import { KAFKA_MODULE_OPTIONS } from './kafka.tokens';

@Injectable()
export class KafkaAdminService {
  private readonly logger = new Logger(KafkaAdminService.name);

  constructor(
    @Inject(KAFKA_MODULE_OPTIONS)
    private readonly options: Required<KafkaModuleOptions>,
  ) {}

  async ensureTopics(topics: ITopicConfig[]): Promise<boolean> {
    if (!topics.length) {
      return false;
    }

    const kafka = new Kafka({
      clientId: `${this.options.clientId}-admin`,
      brokers: this.options.brokers,
    });
    const admin = kafka.admin();

    await admin.connect();

    try {
      const created = await admin.createTopics({
        waitForLeaders: true,
        topics,
      });

      this.logger.log(
        created
          ? `Created Kafka topics: ${topics.map(({ topic }) => topic).join(', ')}`
          : `Kafka topics already exist: ${topics.map(({ topic }) => topic).join(', ')}`,
      );

      return created;
    } finally {
      await admin.disconnect();
    }
  }
}
