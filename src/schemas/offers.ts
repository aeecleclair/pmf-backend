// model InternshipOffer {
//   id         String   @id @default(cuid())
//   title      String
//   content    String
//   authorId   String
//   author     User   @relation(fields: [authorId], references: [id])
//   visibility Boolean  @default(true)
//   category   Category @relation(fields: [categoryId], references: [id])
//   categoryId String
//   tags       Tag[]
//   startDate  DateTime
//   endDate    DateTime
//   duration   Int    // duration in days
//   location   String
//   link       String
//   createdAt  DateTime @default(now())
//   updatedAt  DateTime @updatedAt
// }

// We want to define a ReturnOfferSchema, CreateOfferSchema, and UpdateOfferSchema using TypeBox
import { Static, Type } from '@sinclair/typebox';

export const OfferBaseSchema = Type.Object({
  title: Type.String(),
  content: Type.String(),
  authorId: Type.String(),
  visibility: Type.Boolean(),
  categoryId: Type.String(),
  tags: Type.Array(Type.String()),
  // use RFC3339 date-time strings for compatibility with Fastify/AJV
  startDate: Type.String({ format: 'date-time' }),
  endDate: Type.String({ format: 'date-time' }),
  // duration is an integer (days)
  duration: Type.Integer(),
  location: Type.String(),
  link: Type.String(),
});

export const CreateOfferSchema = OfferBaseSchema;
export type CreateOfferType = Static<typeof CreateOfferSchema>;

export const ReturnOfferSchema = Type.Intersect([
  OfferBaseSchema,
  Type.Object({
    id: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  }),
]);

export const UpdateOfferSchema = Type.Partial(OfferBaseSchema);

export const OfferParamsSchema = Type.Object({
  id: Type.String(),
});
