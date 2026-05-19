import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('processed')
  getProcessedMessages() {
    return this.appService.getProcessedMessages();
  }

  @Post('messages')
  publishMessage(@Body('text') text?: string) {
    return this.appService.publishMessage(text);
  }
}
