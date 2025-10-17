import { FastifyAuthFunction } from '@fastify/auth';
import { fastifyPlugin } from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    verifyJWTandLevel: FastifyAuthFunction;
  }
}

export default fastifyPlugin(async function authPlugin(fastify) {
  // Register JWT plugin for authentication
  await fastify.register(import('@fastify/jwt'), {
    secret: 'supersecret',
  });

  fastify.decorate('verifyJWTandLevel', async function (request, reply, done) {
    const decoded = await request.jwtVerify().catch((err) => {
      done(err); // pass an error if the authentication fails
    });
    console.log('Decoded:', decoded);
    if (decoded !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden' });
    }
  });



  await fastify.register(import('@fastify/auth'));
  fastify.route({
    method: 'POST',
    url: '/auth-multiple',
    preHandler: fastify.auth([
      fastify.verifyJWTandLevel,
    ]),
    handler: (req, reply) => {
      req.log.info('Auth route');
      reply.send({ hello: 'world' });
    },
  });

  

  fastify.route({
    method: 'POST',
    url: '/auth/login',
    handler: (req, reply) => {
      req.log.info('Auth route');
      reply.send({ hello: 'world' });
    },
  });

  fastify.route({
    method: 'GET',
    url: '/test-auth',
    preHandler: fastify.auth([fastify.verifyJWTandLevel]),
    handler: (req, reply) => {
      req.log.info('Auth route');
      reply.send({ hello: 'world' });
    },
  });
});
