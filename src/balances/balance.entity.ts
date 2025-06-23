import Decimal from 'decimal.js';
import { DecimalTransformer } from 'src/helpers/decimalTransformer';
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

  @Column({
    type: 'varchar',
    length: 50,
    transformer: new DecimalTransformer(),
  })
  balance: Decimal;
}
