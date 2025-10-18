import { PrismaClient } from '@prisma/client';
import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

// Plugin Prisma
export default fastifyPlugin(
  async function prismaPlugin(fastify: FastifyInstance) {
    const prisma = new PrismaClient();

    // Test de la connexion
    try {
      await prisma.$connect();
      fastify.log.info('Successfully connected to database');
    } catch (error) {
      fastify.log.error('Failed to connect to database:');
      fastify.log.error(error);
      throw error;
    }

    // Décorer l'instance Fastify avec Prisma
    fastify.decorate('prisma', prisma);

    // Hook pour fermer la connexion proprement
    fastify.addHook('onClose', async (instance) => {
      instance.log.info('Disconnecting from database...');
      await instance.prisma.$disconnect();
    });
  },
  {
    name: 'prisma-plugin',
  },
);

// Déclarations TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
