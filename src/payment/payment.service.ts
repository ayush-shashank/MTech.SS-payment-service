import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './entities/payment-status.entity';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map, of, throwError } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentStatus)
    private paymentStatusRepository: Repository<PaymentStatus>,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  mapCPDtoToPSDto(createPaymentDto: CreatePaymentDto) {
    Logger.debug(createPaymentDto, 'createPaymentDto');
    return createPaymentDto.orders.map((order) => {
      const payment = new Payment();
      payment.userId = createPaymentDto.userId;
      payment.productId = order.productId;
      payment.quantity = order.quantity;
      const paymentStatus = new PaymentStatus();
      paymentStatus.payment = payment;
      return paymentStatus;
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const paymentStatusDto = this.mapCPDtoToPSDto(createPaymentDto);
    const productIds: number[] = [];
    const productQtys: number[] = [];
    paymentStatusDto.forEach((ps) => {
      productIds.push(ps.payment.productId);
      productQtys.push(ps.payment.quantity);
    });
    return this.productClient
      .send('getQuantities', productIds)
      .pipe(
        map((data: { id: number; quantity: number }[]) => {
          return data.map((o) => {
            for (let i = 0; i < productIds.length; ++i) {
              if (o.id === productIds[i]) o.quantity -= productQtys[i];
              if (o.quantity < 0)
                throw new HttpException('Bad Request!', 400, {
                  cause: new Error('Invalid Quantity!'),
                });
            }
            return o;
          });
        }),
        catchError((err) =>
          throwError(() => {
            new HttpException('Bad Request!', 400, {
              cause: new Error('Invalid Quantity!'),
            });
          }),
        ),
      )
      .toPromise()
      .then((update) => {
        const result = this.paymentStatusRepository.save(paymentStatusDto);
        this.emitEvents(createPaymentDto, update, result);
        return result;
      });
  }

  async emitEvents(
    createPaymentDto: CreatePaymentDto,
    update: { id: number; quantity: number }[],
    result: Promise<PaymentStatus[]>,
  ) {
    this.productClient.emit('orderPlaced', update).pipe(
      catchError((err: Error) => {
        Logger.error(err, 'PRODUCT SERVICE');
        return of();
      }),
    );
    const res = await result;
    this.userClient
      .emit('orderPlaced', {
        id: createPaymentDto.userId,
        orders: res.map((ps) => ps.orderId),
      })
      .pipe(
        catchError((err: Error) => {
          Logger.error(err, 'USER SERVICE');
          return of();
        }),
      );
  }

  findAll() {
    return this.paymentRepository.find({});
  }

  findOne(id: number) {
    return this.paymentRepository.findOneBy({ id });
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.paymentRepository.update(id, updatePaymentDto);
  }

  remove(id: number) {
    return this.paymentRepository.delete(id);
  }
}
