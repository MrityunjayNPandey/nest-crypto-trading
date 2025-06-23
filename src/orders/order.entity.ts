import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum OrderType {
  buy = 'BUY',
  sell = 'SELL',
}

export enum OrderStatus {
  pending = 'PENDING',
  fulfilled = 'FULFILLED',
  cancelled = 'CANCELLED',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'order_type', type: 'varchar', length: 4 })
  orderType: OrderType;

  @Column({ name: 'currency_symbol' })
  currencySymbol: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  price: number;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  quantity: number;

  @Column({ type: 'varchar', length: 10, default: OrderStatus.pending })
  status: OrderStatus;
}
