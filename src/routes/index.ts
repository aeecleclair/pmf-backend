import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ItemSchema } from '../schemas';
import offers from './offers';

export default async function routes(fastify: FastifyInstance) {

  await fastify.register(offers);

  fastify.get(
    '/items',
    {
      schema: {
        response: {
          200: Type.Array(ItemSchema),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      return reply.status(200).send("pro ");
    }
  );
  // fastify.get('/items/:id', getItemById);
  // fastify.post('/items', createItem);
  // fastify.put('/items/:id', updateItem);
  // fastify.delete('/items/:id', deleteItem);
}
