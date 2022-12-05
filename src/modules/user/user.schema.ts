import { buildJsonSchemas } from "fastify-zod";
import { string, z } from "zod";
// import { buildJsonSchemas } from "fastify-zod";

const createUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  name: z.string().optional(),
  password: z.string({
    required_error: "password is required",
    invalid_type_error: "password must be a string",
  }),
});

const createUserSchemaResponse = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  name: z.string(),
  id: string(),
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  createUserSchema,
  createUserSchemaResponse,
  loginSchema,
});
