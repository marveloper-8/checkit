import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ChatService } from "src/chat/chat.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderStatus, UserRole } from "@prisma/client";
import { PaginatedResult, PaginationParams } from "src/common/interfaces/pagination.interface";

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private chatService: ChatService
    ) {}

    async create(userId: string, createOrderDto: CreateOrderDto) {
        const order = await this.prisma.order.create({
            data: {
                ...createOrderDto,
                userId
            }
        })

        await this.chatService.createChatRoom(order.id)

        return order
    }

    async findAll(
        userId: string,
        role: UserRole,
        pagination: PaginationParams
    ): Promise<PaginatedResult<any>> {
        const {page, limit} = pagination;
        const skip = (page - 1) * limit;

        const where = role === UserRole.ADMIN ? {} : {userId}

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    user: true,
                    chatRoom: true,
                },
                skip,
                take: limit,
                orderBy: {createdAt: 'desc'}
            }),
            this.prisma.order.count({where})
        ])

        return {
            data: orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    async findOne(id: string, userId: string, role: UserRole) {
        const order = await this.prisma.order.findUnique({
            where: {id},
            include: {
                user: true,
                chatRoom: {
                    include: {
                        messages: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        role: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        if (role !== UserRole.ADMIN && order.userId !== userId) {
            throw new ForbiddenException('Accept denied')
        }

        return order
    }

    async updateStatus(id: string, status: OrderStatus) {
        const order = await this.prisma.order.findUnique({
            where: {id},
            include: {chatRoom: true}
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        if (status === OrderStatus.PROCESSING && order.chatRoom?.isOpen) {
            throw new ForbiddenException('Cannot move to PROCESSING while chat room is open')
        }

        return this.prisma.order.update({
            where: {id},
            data: {status}
        })
    }
}