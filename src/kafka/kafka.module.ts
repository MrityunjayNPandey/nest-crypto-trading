import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConsumerService } from 'src/kafka/kafka-consumer/kafka-consumer.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [ConfigModule, forwardRef(() => OrdersModule)],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
