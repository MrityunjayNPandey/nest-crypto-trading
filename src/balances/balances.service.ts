import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus, OrderType } from '../orders/order.entity';
import { Balance } from './balance.entity';

@Injectable()
export class BalancesService {
  private readonly logger = new Logger(BalancesService.name);

  constructor(
    @InjectRepository(Balance)
    private readonly balancesRepository: Repository<Balance>,
    private readonly dataSource: DataSource, // Inject DataSource to use the query runner for transactions
  ) {}

  async processOrder(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        userId,
        currencySymbol,
        quantity,
        orderType,
        id: orderId,
      } = order;

      // Find the user's balance record for the specific currency
      let userBalance = await queryRunner.manager.findOne(Balance, {
        where: { userId, currencySymbol },
        lock: { mode: 'pessimistic_write' }, // Lock the row to prevent race conditions
      });

      if (orderType === OrderType.buy) {
        if (userBalance) {
          // User has a balance, so we add to it
          const newBalance = userBalance.balance + quantity;
          await queryRunner.manager.update(Balance, userBalance.id, {
            balance: newBalance,
          });
        } else {
          // User does not have a balance for this currency, create a new one
          const newBalanceEntry = this.balancesRepository.create({
            userId,
            currencySymbol,
            balance: quantity,
          });
          await queryRunner.manager.save(newBalanceEntry);
        }
      } else if (orderType === OrderType.sell) {
        if (!userBalance || userBalance.balance < quantity) {
          // Not enough balance, we can't proceed.
          // We'll mark the order as 'cancelled' instead of 'closed'.
          this.logger.warn(
            `User ${userId} has insufficient balance for ${currencySymbol}. Order ${orderId} cancelled.`,
          );
          await this.updateOrderStatus(
            queryRunner.manager,
            orderId,
            OrderStatus.cancelled,
          );
          await queryRunner.commitTransaction();
          return; // Exit early
        }
        // User has sufficient balance, so we deduct from it
        const newBalance =
          parseFloat(userBalance.balance.toString()) -
          parseFloat(quantity.toString());
        await queryRunner.manager.update(Balance, userBalance.id, {
          balance: newBalance,
        });
      }

      // If we reach here, the balance update was successful, so update order status to 'closed'
      await this.updateOrderStatus(
        queryRunner.manager,
        orderId,
        OrderStatus.closed,
      );

      // Commit the transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Order ${orderId} processed successfully.`);
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

  private async updateOrderStatus(
    manager: any,
    orderId: number,
    status: OrderStatus,
  ) {
    await manager.update(Order, orderId, { status });
  }
}
