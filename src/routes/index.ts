import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import offers from './offers';

export async function authenticateRoutes(fastify: FastifyInstance) {

  await fastify.register(offers);

}

export async function publicRoutes(fastify: FastifyInstance) {

  // Auth

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
    }
  );
}


