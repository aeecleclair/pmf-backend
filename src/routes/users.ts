import { deleteUser, findUserById, getFilteredUsers, updateUser } from '../controllers/users';
import { ReturnUserSchema, UpdateUserSchema } from '../schemas/users';
import { FastifyTypeBox } from '../types';
import { Type } from '@fastify/type-provider-typebox';

export default async function routes(fastify: FastifyTypeBox) {
  fastify.get(
    '/users',
    {
      schema: {
        tags: ['Users'],
        response: {
          200: Type.Array(ReturnUserSchema),
        },
        security: [{ bearerAuth: [] }],
        requiredRoles: ['ADMIN'],
      },
    },
    async (req, reply) => {
      const users = await getFilteredUsers(fastify.prisma, {});
      reply.status(200).send(users);
    },
  );

  fastify.get(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: ReturnUserSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const user = await findUserById(fastify.prisma, req.params.id);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      reply.status(200).send(user);
    },
  );

  fastify.get(
    '/users/me',
    {
      schema: {
        tags: ['Users'],
        response: {
          200: ReturnUserSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const user = await findUserById(fastify.prisma, "req.user.id");
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      reply.status(200).send(user);
    },
  );

  fastify.put(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        params: Type.Object({
          id: Type.String(),
        }),
        body: UpdateUserSchema,
        response: {
          200: ReturnUserSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const user = await findUserById(fastify.prisma, req.params.id);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      const updatedUser = await updateUser(fastify.prisma, req.params.id, req.body);
      reply.status(200).send(updatedUser);
    },
  );

  fastify.delete(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          204: Type.Null(),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const user = await findUserById(fastify.prisma, req.params.id);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      await deleteUser(fastify.prisma, req.params.id);
      reply.status(204).send();
    },
  );
}
