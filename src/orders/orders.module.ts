import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalancesModule } from 'src/balances/balances.module';
import { KafkaModule } from '../kafka/kafka.module';
import { OrderProcessorService } from './order-processor/order-processor.service';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => KafkaModule),
    ConfigModule,
    BalancesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderProcessorService],
  exports: [OrdersService, OrderProcessorService],
})
export class OrdersModule {}
