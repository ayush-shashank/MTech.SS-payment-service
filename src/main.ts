import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GlobalExceptionFilter } from './filters/GlobalExceptionFilter';
import { EventInterceptor } from './interceptor/event.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigService>(ConfigService);
  const host = config.get<string>('PAYMENT_HOST', 'localhost');
  const port = +config.get<number>('PAYMENT_PORT', 3003);
  const portHealth = +config.get<number>('PAYMENT_PORT_HEALTH', 3013);

  const paymentService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        host: host,
        port: port,
      },
    });

  paymentService.useGlobalFilters(new GlobalExceptionFilter());
  paymentService.useGlobalInterceptors(new EventInterceptor());

  paymentService.listen();

  await app.listen(portHealth, host, () => {
    console.log(`Payment Service Listening on http://${host}:${portHealth}`);
  });
}
bootstrap();
