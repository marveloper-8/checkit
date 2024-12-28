import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsObject, IsString, Min } from "class-validator";

export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsObject()
    specifications: Record<string, any>

    @ApiProperty()
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({required: false})
    @IsObject()
    metadata?: Record<string, any>
}