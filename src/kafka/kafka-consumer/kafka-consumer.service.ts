import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { OrderProcessorService } from 'src/orders/order-processor/order-processor.service';
import { Order } from 'src/orders/order.entity';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderProcessorService: OrderProcessorService,
  ) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: [this.configService.get<string>('KAFKA_BROKER')!],
    });
    this.consumer = this.kafka.consumer({ groupId: 'crypto-order-processor' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.configService.get<string>('KAFKA_TOPIC')!,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          const order = JSON.parse(message.value!.toString()) as Order;
          this.logger.log(`Received order ${order.id} from topic ${topic}`);
          await this.orderProcessorService.processOrderTransaction(order);
        } catch (error) {
          this.logger.error(
            `Failed to process message from Kafka: ${error.message}`,
            error.stack,
          );
        }
      },
    });
  }

  async onApplicationShutdown() {
    await this.consumer.disconnect();
  }
}
