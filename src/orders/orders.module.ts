import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";

@Module({
    imports: [ChatModule],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService]
})
export class OrdersModule {}