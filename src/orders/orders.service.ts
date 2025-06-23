import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // 1. Create a new order entity from the DTO
    const order = this.ordersRepository.create(createOrderDto);

    // 2. Save the new order to the database
    const savedOrder = await this.ordersRepository.save(order);

    // 3. Produce the order to Kafka
    await this.kafkaProducerService.produce({
      topic: this.configService.get<string>('KAFKA_TOPIC_ORDERS')!,
      messages: [{ value: JSON.stringify(savedOrder) }],
    });

    return savedOrder;
  }
}
