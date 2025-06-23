import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { EntityManager, Repository } from 'typeorm';
import { Balance, CurrencySymbolType } from './balance.entity';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Balance)
    private readonly balancesRepository: Repository<Balance>,
  ) {}

  async createUserBalance(
    userBalanceArgs: Partial<Balance>,
    entityManager: EntityManager,
  ): Promise<Balance> {
    const { userId, currencySymbol, balance } = userBalanceArgs;
    const newBalanceEntry = this.balancesRepository.create({
      userId,
      currencySymbol,
      balance,
    });
    const savedUserBalance = await entityManager.save(newBalanceEntry);
    return savedUserBalance;
  }

  async fetchUserBalance(
    userId: number,
    currencySymbol: CurrencySymbolType,
    entityManager: EntityManager,
  ) {
    const userBalance = await entityManager.findOne(Balance, {
      where: { userId, currencySymbol },
      lock: { mode: 'pessimistic_write' }, // Lock the row to prevent race conditions
    });
    return userBalance;
  }

  async updateUserBalance(
    userBalanceId: number,
    balance: Decimal,
    entityManager: EntityManager,
  ) {
    const userBalance = await entityManager.update(Balance, userBalanceId, {
      balance: balance,
    });
    return userBalance;
  }
}
