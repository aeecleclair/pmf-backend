import { Static, Type } from '@fastify/type-provider-typebox';

export const OfferBaseSchema = Type.Object({
  title: Type.String(),
  content: Type.String(),
  authorId: Type.String(),
  visibility: Type.Boolean(),
  categoryId: Type.String(),
  // use RFC3339 date-time strings for compatibility with Fastify/AJV
  startDate: Type.String({ format: 'date-time' }),
  endDate: Type.String({ format: 'date-time' }),
  // duration is an integer (days)
  duration: Type.Integer(),
  location: Type.String(),
  link: Type.String(),
});

export const CreateOfferSchema = Type.Intersect([
  OfferBaseSchema,
  Type.Object({
    tags: Type.Array(Type.String()), // Array of tag IDs
  }),
]);
export type CreateOfferType = Static<typeof CreateOfferSchema>;

export const ReturnOfferSchema = Type.Intersect([
  OfferBaseSchema,
  Type.Object({
    id: Type.String(),
    tags: Type.Array(
      Type.Object({
        id: Type.String(),
        name: Type.String(),
      })
    ),
    category: Type.Object({
      id: Type.String(),
      name: Type.String(),
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  }),
]);

export const UpdateOfferSchema = Type.Partial(OfferBaseSchema);

export const OfferParamsSchema = Type.Object({
  id: Type.String(),
});
