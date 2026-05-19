import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { KafkaService } from '../kafka.service';
import { KAFKA_CLIENT } from '../kafka.tokens';

describe('KafkaService', () => {
  let service: KafkaService;
  const client = {
    close: jest.fn(),
    connect: jest.fn(),
    emit: jest.fn(() => of(undefined)),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KafkaService,
        {
          provide: KAFKA_CLIENT,
          useValue: client,
        },
      ],
    }).compile();

    service = module.get(KafkaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  it('connects the kafka client when the module initializes', async () => {
    await service.onModuleInit();

    expect(client.connect).toHaveBeenCalledTimes(1);
  });

  it('closes the kafka client when the module is destroyed', async () => {
    await service.onModuleDestroy();

    expect(client.close).toHaveBeenCalledTimes(1);
  });

  it('emits payloads to the requested topic', async () => {
    const payload = { id: 'message-id', text: 'hello kafka' };

    await service.emit('example.topic', payload);

    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledWith('example.topic', payload);
  });
});
