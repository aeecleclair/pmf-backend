import { Static, TSchema, Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  FastifyInstance,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
} from 'fastify';

// See https://github.com/fastify/fastify-type-provider-typebox
export type FastifyTypeBox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

// Convert field from a Return Schema to boolean select object
export type SelectReturnSchema<ReturnSchema extends TSchema> = {
  [K in keyof Static<ReturnSchema>]: true;
};

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Optional(Type.Union([schema, Type.Null()]));
