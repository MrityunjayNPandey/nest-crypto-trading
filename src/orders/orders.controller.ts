import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body(new ValidationPipe()) createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrderTransaction(createOrderDto);
  }
}
