import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createForm,
  deleteFormById,
  getAllForms,
  getAllSubmissionByUserId,
  getFormbyId,
  getSubmissionbyFormId,
  submitFormbyId,
} from "./form.services";
import {
  createFormInput,
  InputParamType,
  SubmitFormInput,
} from "./form.schema";
export async function create(
  request: FastifyRequest<{ Body: createFormInput }>,
  reply: FastifyReply
) {
  const body: any = request.body;
  const user_id = request.user.id;
  try {
    const form = await createForm({ ...body, userId: user_id });
    return reply.code(201).send(form);
  } catch (e) {
    console.log(e);
    return reply.code(404).send();
  }
}

export async function getforms(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user_id = request.user.id;
    const forms: any = await getAllForms(user_id);
    return reply.code(200).send({
      totalForms: forms.length,
      forms: forms.map( (cur: any) => {  return cur.json_build_object }),
    });
  } catch (e) {
    console.log(e);
    return reply.code(500).send();
  }
}

export async function getform(
  request: FastifyRequest<{
    Params: InputParamType;
  }>,
  reply: FastifyReply
) {
  try {
    const user_id = request.user.id;
    const { id } = request.params;
    const form = await getFormbyId(user_id, id);


    // If the form dosen't exist than throw an error.
    if (form.length === 0) {
      throw new Error("The Form dosen't exist");
    }
    // query returns to object in an array and the name of the object is json_build_object
    return reply.code(200).send(form[0].json_build_object);

  } catch (e) {
    console.log(e);
    return reply.code(500).send(e);
  }
}

export async function submitform(
  request: FastifyRequest<{ Params: InputParamType; Body: SubmitFormInput }>,
  reply: FastifyReply
) {
  try {
    const user_id = request.user.id;
    const { id } = request.params;
    const { fields } = request.body;

    // create a form Response
    const formResponse = await submitFormbyId(user_id, id, fields);

    if (!formResponse) {
      throw new Error("Invalid Form Id");
    }

    return reply.code(200).send(formResponse);
  } catch (e) {
    console.log(e);
    return reply.code(500).send(e);
  }
}

// get submission for a single form
export async function getSubmission(
  request: FastifyRequest<{ Params: InputParamType }>,
  reply: FastifyReply
) {
  try {
    const user_id = request.user.id;
    const { id } = request.params;
    const submission: any[] = await getSubmissionbyFormId(user_id, id);
    if (submission.length == 0) {
      return reply.code(200).send({ message: "No submission found" });
    }

    reply.code(200).send(submission);
  } catch (e) {
    console.log(e);
    reply.code(500).send();
  }
}

// get All Submissions for a user
export async function getAllSubmission(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user_id = request.user.id;
    const submissions = await getAllSubmissionByUserId(user_id);
    if (submissions.length == 0) {
      return reply.code(200).send({ message: "No submissions found" });
    }

    reply.code(200).send(submissions);
  } catch (e) {
    console.log(e);
    reply.code(500).send();
  }
}

export async function deleteForm(
  request: FastifyRequest<{ Params: InputParamType }>,
  reply: FastifyReply
) {
  try {
    // const user_id = request.user.id
    const { id } = request.params;
    await deleteFormById(id);
  } catch (e) {
    console.log(e);
    return reply.code(500).send();
  }
}
