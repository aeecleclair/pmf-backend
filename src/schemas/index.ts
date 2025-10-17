import { Type } from "@sinclair/typebox";

const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  age: Type.Optional(Type.Number({ minimum: 0 })),
})

export type User = typeof UserSchema;

export const ItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  owner: UserSchema,
});


