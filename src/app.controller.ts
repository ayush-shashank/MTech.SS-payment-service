import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): string {
    return this.appService.getHealth();
  }

  @MessagePattern('getHealth')
  getHelloMsg() {
    return this.appService.getHealth();
  }
}
