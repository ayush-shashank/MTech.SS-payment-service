export class CreatePaymentDto {
  userId: number;
  orders: { productId: number; quantity: number }[];
}
