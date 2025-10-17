import { CreateOfferSchema, CreateOfferType, ReturnOfferSchema } from '../schemas/offers';
import { getFilteredOffers, createOffer } from '../controllers/offers';
import { FastifyTypeBox } from '../types';

export default async function routes(fastify: FastifyTypeBox) {
  fastify.get(
    '/offers',
    {
      schema: {
        response: {
          200: ReturnOfferSchema,
        },
      },
    },
    async (req, reply) => {
      const offers = await getFilteredOffers({}); // Fetch offers from your data source
      console.log(offers);
      //reply.status(200).send(offers);
    }
  );

  fastify.post(
    '/offers',
    {
      schema: {
        body: CreateOfferSchema,
        response: {
          201: ReturnOfferSchema,
        },
      },
    },
    async (req, reply) => {
      fastify.log.info("Test my offer");
      const newOffer = await createOffer(req.body as CreateOfferType);
      fastify.log.info("Test my offer");
      reply.status(201).send(newOffer);
    }
  );
}
