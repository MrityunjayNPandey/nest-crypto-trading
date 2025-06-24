import Decimal from 'decimal.js';
import { CurrencySymbolType } from 'src/balances/balance.entity';
import { DecimalTransformer } from 'src/helpers/decimalTransformer';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum OrderType {
  buy = 'buy',
  sell = 'sell',
}

export enum OrderStatus {
  open = 'open',
  closed = 'closed',
  cancelled = 'cancelled',
}

@Entity({ name: 'orders' })
@Index(['orderType', 'currencySymbol', 'price', 'quantity', 'status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'order_type', type: 'varchar', length: 4 })
  orderType: OrderType;

  @Column({ name: 'currency_symbol', type: 'varchar', length: 3 })
  currencySymbol: CurrencySymbolType;

  @Column({
    type: 'varchar',
    length: 50,
    transformer: new DecimalTransformer(),
  })
  price: Decimal;

  @Column({
    type: 'varchar',
    length: 50,
    transformer: new DecimalTransformer(),
  })
  quantity: Decimal;

  @Column({ type: 'varchar', length: 10, default: OrderStatus.open })
  status: OrderStatus;
}
