import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaOrderProcessorService } from 'src/kafka/kafka-order-processor/kafka-order-processor.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [ConfigModule, forwardRef(() => OrdersModule)],
  providers: [KafkaProducerService, KafkaOrderProcessorService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
