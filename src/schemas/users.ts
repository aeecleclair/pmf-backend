import { Type } from '@fastify/type-provider-typebox';
import { UserRole } from '@prisma/client';
import { Nullable } from '../types';

export const UserBaseSchema = Type.Object({
  firstname: Nullable(Type.String()),
  lastname: Nullable(Type.String()),
  email: Nullable(Type.String({ format: 'email' })),
  role: Type.Enum(UserRole),
});

export const ReturnUserSchema = Type.Intersect([
  UserBaseSchema,
  Type.Object({
    id: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String(),
  }),
]);

export const UpdateUserSchema = Type.Partial(UserBaseSchema);
