import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Balance } from './balances/balance.entity';
import { BalancesModule } from './balances/balances.module';
import { KafkaModule } from './kafka/kafka.module';
import { Order } from './orders/order.entity';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes .env variables available throughout the app
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Balance, Order],
      synchronize: !!process.env.DB_SYNC, // Recommended: Don't use in production. We already created the tables.
      options: {
        encrypt: false, // For local development; use true for Azure SQL or other secure connections
      },
    }),
    KafkaModule,
    OrdersModule,
    BalancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
