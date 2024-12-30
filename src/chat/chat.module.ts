import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { ChatController } from "./chat.controller";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [ChatService, ChatGateway, JwtService],
    controllers: [ChatController],
    exports: [ChatService]
})
export class ChatModule {}