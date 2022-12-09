import { number, object, string, z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const paramSchema = z.object({
  id: z.string(),
});

const optionSchema = z.object({
  option_id: z.number(),
  value: z.string(),
});

const createFieldSchema = z.object({
  field_id: z.number(),
  type: z.enum(["string", "number", "radio", "multiselect"]),
  description: z.string(),
  options: z.array(optionSchema),
});

const formInputSchema = z.object({
  name: z.string(),
  fields: z.array(createFieldSchema), // array of type fields
});

const createFormSchema = z.object({
  name: z.string(),
  fields: z.array(createFieldSchema), // array of type fields
  userId: z.string(),
});

const responseFormSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const formResponse_optionSchema = z.object({
  opt_id: string(),
});

const formRespone_fieldSchema = z.object({
  field_id: string(),
  response_value: string().optional(),
  options: z.array(formResponse_optionSchema).optional(),
  pos: number()
});

const submitFormSchema = z.object({
  fields: z.array(formRespone_fieldSchema),
});

export type createFormInput = z.infer<typeof createFormSchema>;
export type InputParamType = z.infer<typeof paramSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;

export const { schemas: formSchemas, $ref } = buildJsonSchemas(
  {
    createFormSchema,
    createFieldSchema,
    responseFormSchema,
    formInputSchema,
    paramSchema,
    optionSchema,
    submitFormSchema,
  },
  { $id: "forms" }
);

// Note: $id is important to differentiate different schemas, refere here https://stackoverflow.com/questions/73980097/zod-error-schema-with-id-schema-already-declared
