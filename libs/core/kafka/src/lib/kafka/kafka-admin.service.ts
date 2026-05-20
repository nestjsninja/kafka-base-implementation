import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITopicConfig, Kafka } from 'kafkajs';
import { NormalizedKafkaModuleOptions } from './kafka.interfaces';
import { KAFKA_MODULE_OPTIONS } from './kafka.module-definition';

@Injectable()
export class KafkaAdminService {
  private readonly logger = new Logger(KafkaAdminService.name);

  constructor(
    @Inject(KAFKA_MODULE_OPTIONS)
    private readonly options: NormalizedKafkaModuleOptions,
  ) { }

  async ensureTopics(topics: ITopicConfig[]): Promise<boolean> {
    if (!topics.length) {
      this.logger.log('Skipping Kafka topic provisioning because no topics were configured');
      return false;
    }

    const topicNames = topics.map(({ topic }) => topic).join(', ');
    const clientId = `${this.options.clientId}-admin`;

    this.logger.log(
      `Connecting Kafka admin client "${clientId}" to provision topics: ${topicNames}`,
    );

    const kafka = new Kafka({
      clientId,
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
          ? `Created Kafka topics: ${topicNames}`
          : `Kafka topics already exist: ${topicNames}`,
      );

      return created;
    } catch (error) {
      this.logger.error(
        `Failed to provision Kafka topics: ${topicNames}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await admin.disconnect();
      this.logger.log(`Kafka admin client "${clientId}" disconnected`);
    }
  }
}
