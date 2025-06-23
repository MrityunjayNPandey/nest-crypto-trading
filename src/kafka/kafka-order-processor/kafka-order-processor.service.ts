import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { OrderProcessorService } from 'src/orders/order-processor/order-processor.service';
import { Order } from 'src/orders/order.entity';

@Injectable()
export class KafkaOrderProcessorService implements OnModuleInit {
  private readonly logger = new Logger(KafkaOrderProcessorService.name);
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderProcessorService: OrderProcessorService, // Inject the OrdersService
  ) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: [this.configService.get<string>('KAFKA_BROKER')!],
    });
    // Use a different groupId for each consumer instance to ensure all instances get messages
    this.consumer = this.kafka.consumer({ groupId: 'crypto-order-processor' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.configService.get<string>('KAFKA_TOPIC_ORDERS')!,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          const order = JSON.parse(message.value!.toString()) as Order;
          this.logger.log(`Received order ${order.id} from topic ${topic}`);
          await this.orderProcessorService.processOrder(order);
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
