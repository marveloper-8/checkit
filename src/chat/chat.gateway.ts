import { UseGuards } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtGuard } from "src/auth/guards/ws-jwt.guard";
import { ChatService } from "./chat.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private chatService: ChatService) {}

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`)
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, payload: {roomId: string}) {
        client.join(payload.roomId)
        return {event: 'joinedRoom', data: payload.roomId}
    }

    @SubscribeMessage('leaveRoom')
    async handleLeaveRoom(client: Socket, payload: {roomId: string}) {
        client.leave(payload.roomId)
        return {event: 'leftRoom', data: payload.roomId}
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: {roomId: string; message: string}) {
        const user = (client as any).user
        const message = await this.chatService.createMessage(
            payload.roomId,
            user.id,
            {content: payload.message}
        )

        this.server.to(payload.roomId).emit('message', message)
        return message
    }
}