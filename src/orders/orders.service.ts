import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrderTransaction(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const entityManager = queryRunner.manager;

    try {
      const order = this.ordersRepository.create(createOrderDto);

      const savedOrder = await entityManager.save(order);

      /**
       * NOTE: To do this in a more systematic manner, a separate table should be
       * created for this event and a cron job should actually push the
       * event to the Kafka. (Look into: Transactional Outbox Pattern)
       */
      await this.kafkaProducerService.produce({
        topic: this.configService.get<string>('KAFKA_TOPIC_ORDERS')!,
        messages: [{ value: JSON.stringify(savedOrder) }],
      });
      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async fetchOrderWithLock(orderArgs: Partial<Order>, entityManager: EntityManager) {
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
