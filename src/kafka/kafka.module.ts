import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { OrderProcessorService } from 'src/kafka/order-processor/order-processor.service';
import { BalancesModule } from '../balances/balances.module';

@Module({
  imports: [ConfigModule, BalancesModule], // Import BalancesModule here
  providers: [KafkaProducerService, OrderProcessorService], // Add OrderProcessorService
  exports: [KafkaProducerService],
})
export class KafkaModule {}
