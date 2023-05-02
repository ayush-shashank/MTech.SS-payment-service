import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './entities/payment-status.entity';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentStatus])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'PRODUCT_SERVICE',
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('PRODUCT_HOST', 'localhost');
        const port = +config.get<number>('PRODUCT_PORT', 3003);
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: { host: host, port: port },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'USER_SERVICE',
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('USER_HOST', 'localhost');
        const port = +config.get<number>('USER_PORT', 3001);
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: { host: host, port: port },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class PaymentModule {}
