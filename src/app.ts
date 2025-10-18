import FastifyServer from 'fastify';
import { authenticateRoutes, publicRoutes } from './routes/index';
import fastifyAutoload from '@fastify/autoload';
import path from 'path';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import prisma from './utils/prisma';

export async function buildApp(options = {}) {
  const app = FastifyServer(options).withTypeProvider<TypeBoxTypeProvider>();

  /**
   * Register plugins
   */
  // Register Swagger outside of autoload See https://github.com/fastify/fastify-swagger?tab=readme-ov-file#with-fastifyautoload
  await app.register(import('@fastify/swagger'), {
    openapi: {
      components: {
        securitySchemes: {
          bearerAuth : {
            type: 'http',
            scheme: 'bearer',
          }
        }
      }
    },
  });
  await app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
  });

  // Register plugins from plugins folder
  await app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'plugins'),
    options: {},
  });

  // Connect to the database
  await prisma.$connect();

  // Register routes
  // Public routes
  await app.register(publicRoutes);
  // Protected routes
  app.register((instance) => {
    instance.addHook('onRequest', app.auth([app.verifyJWTandLevel]));
    instance.register(authenticateRoutes);
  });

  // Mark the app as ready
  await app.ready();

  return app;
}
