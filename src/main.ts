import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GlobalExceptionFilter } from './filters/GlobalExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  const host = config.get<string>('PAYMENT_HOST', 'localhost');
  const port = +config.get<number>('PAYMENT_PORT', 3003);
  const paymentService = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: host,
        port: port,
      },
    },
  );
  paymentService.useGlobalFilters(new GlobalExceptionFilter());
  await paymentService.listen();
}
bootstrap();
