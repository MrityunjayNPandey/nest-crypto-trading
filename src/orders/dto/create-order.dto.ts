import {
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  Max,
  Min,
} from '@nestjs/class-validator';
import { CurrencySymbolType, OrderType } from '../order.entity';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  @Max(10)
  userId: number;

  @IsIn(Object.values(OrderType))
  orderType: OrderType;

  @IsIn(Object.values(CurrencySymbolType))
  currencySymbol: CurrencySymbolType;

  @IsNumber()
  @IsPositive()
  @Min(1.123456)
  @Max(9.123456)
  price: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
