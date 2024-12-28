import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { CloseChatRoomDto } from "./dto/close-chat-room.dto";

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async createChatRoom(orderId: string) {
        return this.prisma.chatRoom.create({
            data: { 
                orderId, 
                closedAt: new Date()
            },
        })
    }

    async findChatRoom(chatRoomId: string, userId: string, role: UserRole) {
        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: {id: chatRoomId},
            include: {
                order: true,
                messages: {
                    include: {
                        user: true
                    }
                }
            }
        })

        if (!chatRoom) {
            throw new NotFoundException('Chat room not found')
        }

        if (role !== UserRole.ADMIN && chatRoom.order.userId !== userId) {
            throw new ForbiddenException('Access denied')
        }

        return chatRoom
    }

    async createMessage(
        chatRoomId: string,
        userId: string,
        createMessageDto: CreateMessageDto
    ) {
        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: {id: chatRoomId},
            include: {order: true}
        })

        if (!chatRoom) {
            throw new NotFoundException('Chat room not found')
        }

        if (!chatRoom.isOpen) {
            throw new ForbiddenException('Chat room is closed')
        }

        return this.prisma.message.create({
            data: {
                ...createMessageDto,
                chatRoomId,
                userId
            },
            include: {
                user: true
            }
        })
    }

    async closeChatRoom(
        chatRoomId: string,
        userId: string,
        role: UserRole,
        closeChatRoomDto: CloseChatRoomDto
    ) {
        if (role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can close chat rooms')
        }

        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: {id: chatRoomId}
        })

        if (!chatRoom) {
            throw new NotFoundException('Chat room not found')
        }

        if (!chatRoom.isOpen) {
            throw new ForbiddenException('Chat room is already closed')
        }

        return this.prisma.chatRoom.update({
            where: {id: chatRoomId},
            data: {
                isOpen: false,
                summary: closeChatRoomDto.summary,
                closedAt: new Date(),
                order: {
                    update: {
                        status: 'PROCESSING'
                    }
                }
            }
        })
    }
}