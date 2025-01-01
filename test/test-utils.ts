import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function createTestUser(prisma: PrismaService, role: UserRole = UserRole.USER) {
  const hashedPassword = await bcrypt.hash('password123', 10);
  return prisma.user.create({
    data: {
      email: role === UserRole.ADMIN ? 'admin@test.com' : 'user@test.com',
      password: hashedPassword,
      role,
    },
  });
}

export async function cleanupDatabase(prisma: PrismaService) {
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
}