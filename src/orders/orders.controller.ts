import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorators";
import { UserRole } from "@prisma/client";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({summary: 'Create a new order'})
    @ApiResponse({status: 201, description: 'Order created successfully'})
    @ApiResponse({status: 400, description: 'Invalid input'})
    create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(req.user.id, createOrderDto);
    }

    @Get()
    @ApiOperation({summary: 'Get all orders'})
    @ApiResponse({status: 200, description: 'Returns all orders'})
    findAll(@Request() req) {
        const pagination = { page: 1, limit: 10 };
        return this.ordersService.findAll(req.user.id, req.user.role, pagination);
    }

    @Get(':id')
    @ApiOperation({summary: 'Get order by id'})
    @ApiResponse({status: 200, description: 'Returns the order'})
    @ApiResponse({status: 404, description: 'Order not found'})
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req,
    ) {
        return this.ordersService.findOne(id, req.user.id, req.user.role)
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({summary: 'Update order status (Admin only)'})
    @ApiResponse({status: 200, description: 'Order status updated'})
    @ApiResponse({status: 403, description: 'Forbidden'})
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ) {
        return this.ordersService.updateStatus(id, updateOrderStatusDto.status)
    }
}