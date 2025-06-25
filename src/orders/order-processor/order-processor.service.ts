import { Injectable, Logger } from '@nestjs/common';
import { BalancesService } from 'src/balances/balances.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer/kafka-producer.service';
import { Order, OrderStatus, OrderType } from 'src/orders/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class OrderProcessorService {
  private readonly logger = new Logger(OrderProcessorService.name);

  constructor(
    private readonly balancesService: BalancesService,
    private readonly ordersService: OrdersService,
    private readonly dataSource: DataSource, // DataSource to use the query runner for transactions
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  private async handleCancelOrderTransaction(
    order: Order,
    entityManager: EntityManager,
  ): Promise<boolean> {
    await this.ordersService.updateOrderStatusTransaction(
      order.id,
      OrderStatus.cancelled,
      entityManager,
    );

    this.logger.log(`Order ${order.id}, cancelled.`);

    return true;
  }

  private async handleCloseOrderTransaction(
    order: Order,
    entityManager: EntityManager,
  ): Promise<boolean> {
    await this.ordersService.updateOrderStatusTransaction(
      order.id,
      OrderStatus.closed,
      entityManager,
    );

    this.logger.log(`Order ${order.id}, placed successfully.`);

    return true;
  }

  private async handleOrderTransaction(
    order: Order,
    entityManager: EntityManager,
  ): Promise<boolean> {
    //fetching both orders for locking
    const [requestedOrder, matchingOrder] = await Promise.all([
      this.ordersService.fetchOrderWithLock(order, entityManager),
      this.ordersService.fetchOrderWithLock(
        {
          orderType:
            order.orderType === OrderType.buy ? OrderType.sell : OrderType.buy,
          currencySymbol: order.currencySymbol,
          price: order.price,
          quantity: order.quantity,
          status: OrderStatus.open,
        },
        entityManager,
      ),
    ]);

    if (!requestedOrder) {
      this.logger.log(`Order ${order.id} already executed.`);
      return false;
    }

    if (!matchingOrder) {
      this.logger.log(`Order ${order.id} didn't match with any open orders.`);
      return false;
    }

    const buyOrder =
      requestedOrder.orderType === OrderType.buy
        ? requestedOrder
        : matchingOrder;
    const sellOrder =
      requestedOrder.orderType === OrderType.sell
        ? requestedOrder
        : matchingOrder;

    this.logger.log(`Order ${buyOrder.id} matched with order ${sellOrder.id}.`);

    const [buyerBalance, sellerBalance] = await Promise.all([
      this.balancesService.fetchUserBalanceWithLock(
        buyOrder.userId,
        buyOrder.currencySymbol,
        entityManager,
      ),
      this.balancesService.fetchUserBalanceWithLock(
        sellOrder.userId,
        sellOrder.currencySymbol,
        entityManager,
      ),
    ]);

    if (!sellerBalance || sellerBalance.balance.lessThan(buyOrder.quantity)) {
      this.logger.log(
        `For order ${sellOrder.id}, seller didn't have enough balance.`,
      );

      await this.handleCancelOrderTransaction(sellOrder, entityManager);

      //put the requested buy order into the queue again
      if (order.orderType === OrderType.buy) {
        await this.kafkaProducerService.addMessageIntoQueue(
          JSON.stringify(buyOrder),
        );
      }
      return false;
    } else {
      const newBalance = sellerBalance.balance.minus(buyOrder.quantity);
      await this.balancesService.updateUserBalanceTransaction(
        sellerBalance.id,
        newBalance,
        entityManager,
      );
    }

    if (buyerBalance) {
      /**
       * if the buyer and the seller are the same (we wouldn't be able to acquire locks as both are in same transaction),
       * if we don't add this if block, we'll add an edge case of user being able to generate free money
       */
      if (buyerBalance.id === sellerBalance.id) {
        buyerBalance.balance = sellerBalance.balance.minus(buyOrder.quantity);
      }

      const newBalance = buyerBalance.balance.plus(buyOrder.quantity);
      await this.balancesService.updateUserBalanceTransaction(
        buyerBalance.id,
        newBalance,
        entityManager,
      );
    } else {
      await this.balancesService.createUserBalanceTransaction(
        {
          userId: buyOrder.userId,
          currencySymbol: buyOrder.currencySymbol,
          balance: buyOrder.quantity,
        },
        entityManager,
      );
    }

    await Promise.all([
      this.handleCloseOrderTransaction(buyOrder, entityManager),
      this.handleCloseOrderTransaction(sellOrder, entityManager),
    ]);

    return true;
  }

  async processOrderTransaction(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const entityManager = queryRunner.manager;

    try {
      const orderProcessed = await this.handleOrderTransaction(
        order,
        entityManager,
      );

      await queryRunner.commitTransaction();
      if (orderProcessed) {
        this.logger.log(`Order ${order.id} processed successfully.`);
      }
    } catch (err) {
      // If any error occurs, roll back the transaction
      this.logger.error(
        `Failed to process order ${order.id}. Rolling back transaction.`,
        err.stack,
      );
      await queryRunner.rollbackTransaction();

      //put it again into the queue (can use DLQ, however, the error is most probably because of locking)
      await this.kafkaProducerService.addMessageIntoQueue(
        JSON.stringify(order),
      );
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
