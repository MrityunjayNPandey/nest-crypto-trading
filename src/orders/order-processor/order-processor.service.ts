import { Injectable, Logger } from '@nestjs/common';
import { BalancesService } from 'src/balances/balances.service';
import { Order, OrderStatus, OrderType } from 'src/orders/order.entity';
import { OrdersService } from 'src/orders/orders.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class OrderProcessorService {
  private readonly logger = new Logger(OrderProcessorService.name);

  constructor(
    private readonly balancesService: BalancesService, // Inject the BalancesService
    private readonly ordersService: OrdersService, // Inject the OrdersService
    private readonly dataSource: DataSource, // Inject DataSource to use the query runner for transactions
  ) {}

  private async handleCancelOrder(
    order: Order,
    entityManager: EntityManager,
  ): Promise<boolean> {
    await this.ordersService.updateOrderStatus(
      order.id,
      OrderStatus.cancelled,
      entityManager,
    );

    this.logger.log(`Order ${order.id}, cancelled.`);

    return true;
  }

  private async handleCloseOrder(
    order: Order,
    entityManager: EntityManager,
  ): Promise<boolean> {
    await this.ordersService.updateOrderStatus(
      order.id,
      OrderStatus.closed,
      entityManager,
    );

    this.logger.log(`Order ${order.id}, placed successfully.`);

    return true;
  }

  private async handleOrder(
    order: Order,
    entityManager: EntityManager,
  ): Promise<boolean> {
    //fetching both orders for locking
    let [buyOrder, sellOrder] = await Promise.all([
      this.ordersService.fetchOrder(order, entityManager),
      this.ordersService.fetchOrder(
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

    if (!buyOrder || !sellOrder) {
      this.logger.log(`Order ${order.id} didn't match with any open orders.`);
      return false;
    }

    if (buyOrder.orderType !== OrderType.buy) {
      [buyOrder, sellOrder] = [sellOrder, buyOrder];
    }

    const [buyerBalance, sellerBalance] = await Promise.all([
      this.balancesService.fetchUserBalance(
        buyOrder.userId,
        buyOrder.currencySymbol,
        entityManager,
      ),
      this.balancesService.fetchUserBalance(
        sellOrder.userId,
        sellOrder.currencySymbol,
        entityManager,
      ),
    ]);

    if (!sellerBalance || sellerBalance.balance < buyOrder.quantity) {
      this.logger.log(
        `For order ${sellOrder.id}, buyer didn't have enough balance.`,
      );
      await this.handleCancelOrder(sellOrder, entityManager);
      return false;
    } else {
      const newBalance = sellerBalance.balance.minus(buyOrder.quantity);
      await this.balancesService.updateUserBalance(
        sellerBalance.id,
        newBalance,
        entityManager,
      );
    }

    if (buyerBalance) {
      const newBalance = buyerBalance.balance.plus(buyOrder.quantity);
      await this.balancesService.updateUserBalance(
        buyerBalance.id,
        newBalance,
        entityManager,
      );
    } else {
      await this.balancesService.createUserBalance(
        {
          userId: buyOrder.userId,
          currencySymbol: buyOrder.currencySymbol,
          balance: buyOrder.quantity,
        },
        entityManager,
      );
    }

    await Promise.all([
      this.handleCloseOrder(buyOrder, entityManager),
      this.handleCloseOrder(sellOrder, entityManager),
    ]);

    return true;
  }

  async processOrder(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const entityManager = queryRunner.manager;

    try {
      const orderProcessed = await this.handleOrder(order, entityManager);

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
      // Optionally, you can re-throw the error or handle it
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
