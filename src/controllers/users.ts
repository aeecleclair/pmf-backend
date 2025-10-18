import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email },
  });
}

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
  });
}
