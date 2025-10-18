import { CreateOfferSchema, CreateOfferType, ReturnOfferSchema } from '../schemas/offers';
import { getFilteredOffers, createOffer } from '../controllers/offers';
import { FastifyTypeBox } from '../types';
import { Type } from '@fastify/type-provider-typebox';
import { validateCategory, validateTags } from '../utils/functions';

export default async function routes(fastify: FastifyTypeBox) {
  fastify.get(
    '/offers',
    {
      schema: {
        tags: ['Offers'],
        response: {
          200: Type.Array(ReturnOfferSchema),
        },
      },
    },
    async (req, reply) => {
      const offers = await getFilteredOffers(fastify.prisma, {}); // Fetch offers from your data source
      reply.status(200).send(offers);
    },
  );

  fastify.post(
    '/offers',
    {
      schema: {
        tags: ['Offers'],
        body: CreateOfferSchema,
        response: {
          201: ReturnOfferSchema,
          400: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (req, reply) => {
      const body = req.body as CreateOfferType;

      // Verify that these tags exist in the database
      if (!(await validateTags(fastify.prisma, body.tags))) {
        return reply.status(400).send({
          message: 'One or more provided tags do not exist. Please use the tags ids.',
        });
      }

      // Verify that the category exists in the database
      if (!(await validateCategory(fastify.prisma, body.categoryId))) {
        return reply.status(400).send({
          message: `The provided category (${body.categoryId}) does not exist.`,
        });
      }

      const newOffer = await createOffer(fastify.prisma, body);
      reply.status(201).send(newOffer);
    },
  );
}
