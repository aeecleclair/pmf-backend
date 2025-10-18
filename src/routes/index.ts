import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import offers from './offers';
import auth from './auth';

export async function authenticateRoutes(fastify: FastifyInstance) {
  // Load protected routes here
  await fastify.register(offers);
}

export async function publicRoutes(fastify: FastifyInstance) {
  // Import authentication routes
  await fastify.register(auth);

  fastify.get(
    '/health',
    {
      schema: {
        response: {
          200: Type.Object({
            status: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      return { status: 'ok' };
    },
  );
}
