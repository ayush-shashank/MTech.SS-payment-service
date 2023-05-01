import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  userID: number;
  @Column({ nullable: false })
  productId: number;
}
