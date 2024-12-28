import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CloseChatRoomDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    summary: string
}