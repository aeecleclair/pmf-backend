import { Static, Type } from "@fastify/type-provider-typebox";

export const LoginBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});
export type LoginBodyType = Static<typeof LoginBodySchema>;

export const RegisterBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
  firstname: Type.String(),
  lastname: Type.String(),
});
export type RegisterBodyType = Static<typeof RegisterBodySchema>;
