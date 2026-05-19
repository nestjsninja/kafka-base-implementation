import { Test } from '@nestjs/testing';
import { KafkaService } from '@kafka-base-implementation/core/kafka';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  const kafkaService = { emit: jest.fn() };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: KafkaService,
          useValue: kafkaService,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return producer metadata', () => {
      expect(service.getData()).toMatchObject({ service: 'producer-api' });
    });
  });
});
