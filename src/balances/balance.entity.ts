import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'balances' })
@Index(['userId', 'currencySymbol'], { unique: true })
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'currency_symbol' })
  currencySymbol: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  balance: number;
}
