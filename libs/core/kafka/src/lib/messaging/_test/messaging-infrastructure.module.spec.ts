import { KafkaAdminService } from '../../kafka';
import { MessagingInfrastructureModule } from '../messaging-infrastructure.module';
import { MessagingTopicProvisionerService } from '../messaging-topic-provisioner.service';

const topics = [
  {
    topic: 'example.message.created',
    numPartitions: 3,
    replicationFactor: 1,
  },
];

describe('MessagingInfrastructureModule', () => {
  it('builds a dynamic module with topic provisioning options', () => {
    const dynamicModule = MessagingInfrastructureModule.register({
      topics,
      ensureTopics: true,
    });

    expect(dynamicModule.module).toBe(MessagingInfrastructureModule);
    expect(dynamicModule.imports).toHaveLength(1);
    expect(dynamicModule.providers).toContain(MessagingTopicProvisionerService);
  });

  it('ensures configured topics exist on module initialization', async () => {
    const kafkaAdminService = {
      ensureTopics: jest.fn().mockResolvedValue(true),
    };
    const provisioner = new MessagingTopicProvisionerService(
      kafkaAdminService as unknown as KafkaAdminService,
      {
        topics,
        ensureTopics: true,
      },
    );

    await provisioner.onModuleInit();

    expect(kafkaAdminService.ensureTopics).toHaveBeenCalledWith(topics);
  });

  it('does not ensure topics when topic creation is disabled', async () => {
    const kafkaAdminService = {
      ensureTopics: jest.fn().mockResolvedValue(true),
    };
    const provisioner = new MessagingTopicProvisionerService(
      kafkaAdminService as unknown as KafkaAdminService,
      {
        topics,
        ensureTopics: false,
      },
    );

    await provisioner.onModuleInit();

    expect(kafkaAdminService.ensureTopics).not.toHaveBeenCalled();
  });
});
