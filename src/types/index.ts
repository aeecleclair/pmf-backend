import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
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
