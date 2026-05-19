import { Test } from '@nestjs/testing';
import { ExampleMessagingService } from '@kafka-base-implementation/components/example-messaging';
import { AppService } from '../app.service';

describe('AppService', () => {
  let service: AppService;
  const exampleMessagingService = { emitMessageProcessed: jest.fn() };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ExampleMessagingService,
          useValue: exampleMessagingService,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return consumer metadata', () => {
      expect(service.getData()).toMatchObject({ service: 'consumer-api' });
    });
  });
});
