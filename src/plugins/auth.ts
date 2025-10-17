import type { FastifyAuthFunction } from '@fastify/auth';
import { fastifyPlugin } from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyJWTandLevel: FastifyAuthFunction;
  }
}

export default fastifyPlugin(async function authPlugin(fastify) {
  // Register JWT plugin for authentication
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'supersecret', // TODO: Parse correctly .env
  });

  fastify.decorate('verifyJWTandLevel', async function (request, reply, done) {
    await request.jwtVerify().catch((err) => {
      done(err); // pass an error if the authentication fails
    });
  });

  await fastify.register(import('@fastify/auth'));
});
