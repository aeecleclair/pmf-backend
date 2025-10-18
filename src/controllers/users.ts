import type { Prisma, PrismaClient } from '@prisma/client';
import { getSelectFromSchema } from '../utils/functions';
import { ReturnUserSchema } from '../schemas/users';

export async function getFilteredUsers(prisma: PrismaClient, filters: {
  before?: Date;
  after?: Date;
  firstname?: string;
  lastname?: string;
  email?: string;
}) {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { createdAt: { lt: filters.before } },
        { createdAt: { gt: filters.after } },
        { firstname: { contains: filters.firstname } },
        { lastname: { contains: filters.lastname } },
        { email: { contains: filters.email } },
      ],
    },
    select: getSelectFromSchema<typeof ReturnUserSchema>(ReturnUserSchema),
  });
  return users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }));
}

export async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({
    where: { email: email },
  });
}

export async function findUserById(prisma: PrismaClient, id: string) {
  const user = await prisma.user.findUnique({
    where: { id: id },
  });
  if (user) {
    return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
  }
  return null;
}

export async function updateUser(prisma: PrismaClient, id: string, data: Prisma.UserUpdateInput) {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
}

export async function deleteUser(prisma: PrismaClient, id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function createUser(prisma: PrismaClient, data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
  });
}
