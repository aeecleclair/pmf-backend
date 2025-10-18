import { createUser, findUserByEmail } from '../controllers/users';
import { LoginBodySchema, RegisterBodySchema } from '../schemas/auth';
import { FastifyTypeBox } from '../types';
import { Type } from '@fastify/type-provider-typebox';
import { comparePassword, hashPassword } from '../utils/functions';
import { UserRole } from '@prisma/client';

export default async function routes(fastify: FastifyTypeBox) {
  fastify.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        body: LoginBodySchema,
        response: {
          200: Type.Object({ token: Type.String() }),
          401: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body;

      // Implement your login logic here
      const user = await findUserByEmail(fastify.prisma, email);

      if (!user || !user.password || !(await comparePassword(password, user.password))) {
        return reply.status(401).send({ message: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign(
        { id: user.id },
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
      ); // TODO: Parse correctly .env
      reply.status(200).send({ token });
    },
  );

  fastify.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        body: RegisterBodySchema,
        response: {
          201: Type.Object({ message: Type.String() }),
          400: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const { email, password, firstname, lastname } = req.body;
      const existingUser = await findUserByEmail(fastify.prisma, email);

      if (existingUser) {
        return reply.status(400).send({ message: 'User already exists' });
      }

      // Hash the password before storing
      const hashedPassword = await hashPassword(password);

      await createUser(fastify.prisma, {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        role: UserRole.ALUMNI,
      });

      reply.status(201).send({ message: 'User registered successfully' });
    },
  );
}
