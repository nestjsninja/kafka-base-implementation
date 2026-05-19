import { Test } from '@nestjs/testing';
import { ExampleMessagingService } from '@kafka-base-implementation/components/example-messaging';
import { AppService } from '../app.service';

describe('AppService', () => {
  let service: AppService;
  const exampleMessagingService = { emitMessageCreated: jest.fn() };

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
    it('should return producer metadata', () => {
      expect(service.getData()).toMatchObject({ service: 'producer-api' });
    });
  });
});
