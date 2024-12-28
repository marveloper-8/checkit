import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import * as bcrypt from "bcrypt"

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.findByEmail(createUserDto.email)
        if (existingUser) {
            throw new ConflictException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword
            }
        })

        const {password, ...result} = user
        return result
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        })
        return users
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {email}
        })
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        })
    }
}