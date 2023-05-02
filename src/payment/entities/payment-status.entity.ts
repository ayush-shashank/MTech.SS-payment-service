import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PaymentStatus {
  @PrimaryColumn()
  orderId: number;

  @OneToOne(() => Payment, (payment) => payment.id, { cascade: true })
  @JoinColumn({ name: 'orderId' })
  payment: Payment;

  @Column({ default: 'open' })
  status: 'open' | 'cancelled' | 'delivered' = 'open';

  @BeforeInsert()
  mapId() {
    this.orderId = this.payment.id;
  }
}
