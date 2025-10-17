import FastifyServer, { FastifyReply, FastifyRequest } from 'fastify';
import routes from './routes/index';
import fastifyAutoload from '@fastify/autoload';
import path from 'path';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

declare module 'fastify' {
  interface FastifyInstance {
    verifyJWTandLevel: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: any) => void
    ) => Promise<void>;
    verifyUserAndPassword: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: any) => void
    ) => Promise<void>;
  }
}

export async function buildApp(options = {}) {
  const app = FastifyServer(options).withTypeProvider<TypeBoxTypeProvider>();

  /**
   * Register plugins
   */
  // Register Swagger outside of autoload See https://github.com/fastify/fastify-swagger?tab=readme-ov-file#with-fastifyautoload
  await app.register(import('@fastify/swagger'));
  await app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
  });
  
  await app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'plugins'),
    options: {},
  });

  await app.register(routes);

  await app.register(import('@fastify/jwt'), {
    secret: 'supersecret',
  });

  app
    .decorate(
      'verifyJWTandLevel',
      async function (
        request: FastifyRequest,
        reply: FastifyReply,
        done: (err?: any) => void
      ) {
        const decoded = await request.jwtVerify().catch((err) => {
          done(err); // pass an error if the authentication fails
        });
        console.log('Decoded:', decoded);
        if (decoded !== 'admin') {
          return reply.code(403).send({ message: 'Forbidden' });
        }
      }
    )
    .decorate(
      'verifyUserAndPassword',
      async function (
        request: FastifyRequest,
        reply: FastifyReply,
        done: (err?: any) => void
      ) {
        if (
          request.headers.authorization !== 'Basic dGVzdHVzZXI6dGVzdHBhc3M='
        ) {
          return reply.code(401).send({ message: 'Unauthorized' });
        }
        // your validation logic
        done(); // pass an error if the authentication fails
      }
    )
    .register(import('@fastify/auth'))
    .after(() => {
      app.route({
        method: 'POST',
        url: '/auth-multiple',
        preHandler: app.auth([
          app.verifyJWTandLevel,
          app.verifyUserAndPassword,
        ]),
        handler: (req: FastifyRequest, reply: FastifyReply) => {
          req.log.info('Auth route');
          reply.send({ hello: 'world' });
        },
      });

      app.route({
        method: 'GET',
        url: '/test-auth',
        preHandler: app.auth([app.verifyJWTandLevel]),
        handler: (req: FastifyRequest, reply: FastifyReply) => {
          req.log.info('Auth route');
          reply.send({ hello: 'world' });
        },
      });
    });

  await app.ready();

  return app;
}
