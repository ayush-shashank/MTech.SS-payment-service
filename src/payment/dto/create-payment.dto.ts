export class CreatePaymentDto {
  userId: number;
  productIds: number[];
  quantity = 1;
}
