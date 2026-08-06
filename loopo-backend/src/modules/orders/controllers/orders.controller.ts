import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/order.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @Roles('USER')
  @ApiOperation({ summary: 'Place a new purchase order' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  async placeOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.service.createOrder(req.user.id, dto);
  }

  @Get('buyer')
  @Roles('USER')
  @ApiOperation({ summary: 'List orders placed by the current user as buyer' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getMyPurchases(
    @Request() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipVal = skip ? parseInt(skip, 10) : undefined;
    const takeVal = take ? parseInt(take, 10) : undefined;
    return this.service.getOrdersForBuyer(req.user.id, skipVal, takeVal);
  }

  @Get('seller')
  @Roles('USER')
  @ApiOperation({ summary: 'List orders received by the current user as seller' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getMySales(
    @Request() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipVal = skip ? parseInt(skip, 10) : undefined;
    const takeVal = take ? parseInt(take, 10) : undefined;
    return this.service.getOrdersForSeller(req.user.id, skipVal, takeVal);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Get details of a specific order' })
  async getOrderDetails(@Param('id') id: string, @Request() req: any) {
    return this.service.getOrderDetails(id, req.user.id, req.user.roles);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Update status of an order' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('ADMIN');
    return this.service.updateOrderStatus(id, dto.status, req.user.id, isAdmin);
  }
}
