import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly configService: ConfigService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(createOrderDto);

    const savedOrder = await this.ordersRepository.save(order);

    /**
     * NOTE: To do this in a more systematic manner, this should be done as
     * a transaction and a separate table should be created for this event
     * and a cron job should actually push the event to the Kafka.
     * (Transactional Outbox Pattern)
     */
    await this.kafkaProducerService.addMessageIntoQueue(
      JSON.stringify(savedOrder),
    );
    return order;
  }

  async fetchOrderWithLock(
    orderArgs: Partial<Order>,
    entityManager: EntityManager,
  ) {
    const order = await entityManager.findOne(Order, {
      where: orderArgs,
      order: { id: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });
    return order;
  }

  async updateOrderStatusTransaction(
    orderId: number,
    status: OrderStatus,
    entityManager: EntityManager,
  ) {
    await entityManager.update(Order, orderId, { status });
  }
}
