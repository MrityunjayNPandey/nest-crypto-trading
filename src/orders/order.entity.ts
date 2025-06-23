import { CurrencySymbolType } from 'src/balances/balance.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'order_type', type: 'varchar', length: 3 })
  orderType: OrderType;

  @Column({ name: 'currency_symbol', type: 'varchar', length: 3 })
  currencySymbol: CurrencySymbolType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  price: number;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  quantity: number;

  @Column({ type: 'varchar', length: 10, default: OrderStatus.open })
  status: OrderStatus;
}
