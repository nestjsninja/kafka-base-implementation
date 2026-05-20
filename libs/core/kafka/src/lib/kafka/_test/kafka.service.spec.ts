import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { KafkaService } from '../kafka.service';
import { KAFKA_CLIENT } from '../kafka.tokens';

describe('KafkaService', () => {
  let service: KafkaService;
  const client = {
    close: jest.fn(),
    commitOffsets: jest.fn(),
    connect: jest.fn(),
    emit: jest.fn(() => of(undefined)),
    emitBatch: jest.fn(() => of(undefined)),
    consumer: { type: 'consumer' },
    producer: { type: 'producer' },
    send: jest.fn(() => of({ ok: true })),
    subscribeToResponseOf: jest.fn(),
    unwrap: jest.fn(() => ({ type: 'raw-client' })),
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

  it('returns an emit observable when requested', (done) => {
    const payload = { id: 'message-id', text: 'hello kafka' };

    service.emit$('example.topic', payload).subscribe(() => {
      expect(client.emit).toHaveBeenCalledWith('example.topic', payload);
      done();
    });
  });

  it('emits batches to the requested topic', async () => {
    const messages = [{ id: 'message-id', text: 'hello kafka' }];

    await service.emitBatch('example.topic', messages);

    expect(client.emitBatch).toHaveBeenCalledWith('example.topic', {
      messages,
    });
  });

  it('sends request-response messages', (done) => {
    const payload = { id: 'message-id', text: 'hello kafka' };

    service.send('example.request', payload).subscribe((response) => {
      expect(response).toEqual({ ok: true });
      expect(client.send).toHaveBeenCalledWith('example.request', payload);
      done();
    });
  });

  it('awaits request-response messages', async () => {
    const payload = { id: 'message-id', text: 'hello kafka' };

    await expect(service.request('example.request', payload)).resolves.toEqual({
      ok: true,
    });
  });

  it('subscribes to response patterns', () => {
    service.subscribeToResponseOf('example.request');

    expect(client.subscribeToResponseOf).toHaveBeenCalledWith(
      'example.request',
    );
  });

  it('commits offsets through the Kafka client', async () => {
    const offsets = [
      {
        topic: 'example.topic',
        partition: 0,
        offset: '1',
      },
    ];

    await service.commitOffsets(offsets);

    expect(client.commitOffsets).toHaveBeenCalledWith(offsets);
  });

  it('exposes the underlying Kafka client and native handles', () => {
    expect(service.getClient()).toBe(client);
    expect(service.getConsumer()).toBe(client.consumer);
    expect(service.getProducer()).toBe(client.producer);
    expect(service.unwrap()).toEqual({ type: 'raw-client' });
  });
});
