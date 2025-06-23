import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from './balance.entity';
import { BalancesService } from './balances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Balance])],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {}
