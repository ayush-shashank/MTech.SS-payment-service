import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  create(createPaymentDto: CreatePaymentDto) {
    createPaymentDto.productIds.forEach((productId) => {
      const paymentDto = {
        userId: createPaymentDto.userId,
        productId,
        quantity: createPaymentDto.quantity,
      };
      return this.paymentRepository.save(paymentDto);
    });
    // return 'This action adds a new payment';
  }

  findAll() {
    return this.paymentRepository.find({});
    // return `This action returns all payment`;
  }

  findOne(id: number) {
    return this.paymentRepository.findOneBy({ id });
    // return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return this.paymentRepository.delete(id);
    // return `This action removes a #${id} payment`;
  }
}
