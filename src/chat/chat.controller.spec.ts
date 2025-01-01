import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CloseChatRoomDto } from './dto/close-chat-room.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Test, TestingModule } from '@nestjs/testing';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const mockChatService = {
    findChatRoom: jest.fn(),
    createMessage: jest.fn(),
    closeChatRoom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findChatRoom', () => {
    it('should return chat room details', async () => {
      const mockRequest = { user: { id: '1', role: 'USER' } };
      const roomId = 'room-123';
      const expectedResult = { id: roomId, messages: [] };

      mockChatService.findChatRoom.mockResolvedValue(expectedResult);

      const result = await controller.findChatRoom(roomId, mockRequest);

      expect(chatService.findChatRoom).toHaveBeenCalledWith(
        roomId,
        mockRequest.user.id,
        mockRequest.user.role
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const mockRequest = { user: { id: '1' } };
      const roomId = 'room-123';
      const createMessageDto: CreateMessageDto = {
        content: 'Test message'
      };
      const expectedResult = { 
        id: 'msg-1',
        content: createMessageDto.content,
        roomId 
      };

      mockChatService.createMessage.mockResolvedValue(expectedResult);

      const result = await controller.createMessage(
        roomId,
        mockRequest,
        createMessageDto
      );

      expect(chatService.createMessage).toHaveBeenCalledWith(
        roomId,
        mockRequest.user.id,
        createMessageDto
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('closeChatRoom', () => {
    it('should close the chat room', async () => {
      const mockRequest = { user: { id: '1', role: 'USER' } };
      const roomId = 'room-123';
      const closeChatRoomDto: CloseChatRoomDto = {
        summary: 'Chat completed'
      };
      const expectedResult = { 
        id: roomId,
        status: 'CLOSED',
        summary: closeChatRoomDto.summary 
      };

      mockChatService.closeChatRoom.mockResolvedValue(expectedResult);

      const result = await controller.closeChatRoom(
        roomId,
        mockRequest,
        closeChatRoomDto
      );

      expect(chatService.closeChatRoom).toHaveBeenCalledWith(
        roomId,
        mockRequest.user.id,
        mockRequest.user.role,
        closeChatRoomDto
      );
      expect(result).toEqual(expectedResult);
    });
  });
});