import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userID: number;
  @Column()
  productId: number;
  @Column()
  quantity: number;
}
