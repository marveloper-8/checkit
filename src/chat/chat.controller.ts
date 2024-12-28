import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { CloseChatRoomDto } from "./dto/close-chat-room.dto";

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('rooms/:id')
    @ApiOperation({summary: 'Get chat room by id'})
    findChatRoom(@Param('id') id: string, @Request() req) {
        return this.chatService.findChatRoom(id, req.user.id, req.user.role)
    }

    @Post('rooms/:id/messages')
    @ApiOperation({summary: 'Create new message in chat room'})
    createMessage(
        @Param('id') id: string,
        @Request() req,
        @Body() createMessageDto: CreateMessageDto,
    ) {
        return this.chatService.createMessage(id, req.user.id, createMessageDto)
    }

    @Post('rooms/:id/close')
    @ApiOperation({summary: 'Close chat room'})
    closeChatRoom(
        @Param('id') id: string,
        @Request() req,
        @Body() closeChatRoomDto: CloseChatRoomDto,
    ) {
        return this.chatService.closeChatRoom(
            id,
            req.user.id,
            req.user.role,
            closeChatRoomDto
        )
    }
}