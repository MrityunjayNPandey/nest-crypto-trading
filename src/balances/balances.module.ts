import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Balance } from './balance.entity';
import { BalancesService } from './balances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Balance, Order])],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {}
