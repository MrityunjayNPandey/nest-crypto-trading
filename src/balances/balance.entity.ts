import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum CurrencySymbolType {
  btc = 'BTC',
  eth = 'ETH',
}

@Entity({ name: 'balances' })
@Index(['userId', 'currencySymbol'], { unique: true })
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'currency_symbol', type: 'varchar', length: 3 })
  currencySymbol: CurrencySymbolType;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  balance: number;
}
