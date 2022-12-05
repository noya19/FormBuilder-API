import prisma from "../../utils/prisma";
import { createFormInput } from "./form.schema";
import {
  getFormTemplates,
  ResponseFormatter,
} from "../../utils/formResponseFormatter";

export async function createForm(data: createFormInput) {
  const { fields, name, userId } = data;

  const form = await prisma.form.create({
    data: {
      name,
      userId: userId,
    },
  });

  fields.forEach(async (cur) => {
    await prisma.field.create({
      data: {
        form_id: form.id,
        field_id: cur.field_id,
        type: cur.type,
        description: cur.description,
        Options: {
          createMany: {
            data: cur.options,
          },
        },
      },
    });
  });

  return form;
}

export async function getAllForms(user_id: string) {
  return await prisma.form.findMany({
    where: {
      userId: user_id,
    },
    select: {
      id: true,
      name: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      Field: {
        orderBy: [
          {
            field_id: "asc",
          },
        ],
        select: {
          id: true,
          field_id: true,
          type: true,
          description: true,
          Options: {
            orderBy: [
              {
                option_id: "asc",
              },
            ],
            select: {
              value: true,
            },
          },
        },
      },
    },
  });
}

// Note: since we are using findMany, this function returns an array.
export async function getFormbyId(user_id: string, form_id: string) {
  return await prisma.form.findMany({
    where: {
      userId: user_id,
      id: form_id,
    },
    select: {
      id: true,
      name: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      Field: {
        orderBy: [
          {
            field_id: "asc",
          },
        ],
        select: {
          id: true,
          field_id: true,
          type: true,
          description: true,
          Options: {
            orderBy: [
              {
                option_id: "asc",
              },
            ],
            select: {
              id: true,
              option_id: true,
              value: true,
            },
          },
        },
      },
    },
  });
}

export async function submitFormbyId(
  user_id: string,
  form_id: string,
  fields: any
) {
  // check if the form exits
  const form = await getFormbyId(user_id, form_id);
  if (form.length === 0) {
    return false;
  }

  // create a new response
  const response = await prisma.formResponse.create({
    data: {
      form_id,
      user_id,
    },
  });

  // create the fields related to it
  fields.forEach(async (cur: any) => {
    await prisma.formResponseFields.create({
      data: {
        field_id: cur.field_id,
        response_value: cur.response_value,
        formresponse_id: response.id,
        FormResponseOptions: {
          createMany: {
            data: cur.options,
          },
        },
      },
    });
  });

  return response;
}

export async function getSubmissionbyFormId(user_id: string, form_id: string) {
  const formTemplate = await getFormbyId(user_id, form_id);
  const formResponse = await prisma.formResponse.findMany({
    where: {
      form_id,
      user_id,
    },
    select: {
      id: true,
      createdAt: true,
      FormResponseFields: {
        select: {
          field_id: true,
          response_value: true,
          FormResponseOptions: {
            select: {
              opt_id: true,
            },
          },
        },
      },
    },
  });

  // Format the Response for the Output.
  const newResponse = await ResponseFormatter(formTemplate, formResponse);

  // const field_template = formTemplate[0].Field;
  // const fieldResponse_template = formResponse[0].FormResponseFields;

  // // New Response Object
  // const newResponse: any[] = [];
  // field_template.forEach( (cur, i) => {
  //     const tempObj: any = {}
  //     tempObj.description = cur.description;
  //     if( fieldResponse_template[i].response_value !== null && fieldResponse_template[i].FormResponseOptions.length == 0){
  //         tempObj.response_value = fieldResponse_template[i].response_value;
  //     }else if(fieldResponse_template[i].response_value === null && fieldResponse_template[i].FormResponseOptions.length != 0){
  //         const newOptions: any[] = [];
  //         const options = fieldResponse_template[i].FormResponseOptions;
  //         options.forEach((ele) => {
  //             const opt = cur.Options.find( (obj) => obj.id === ele.opt_id);
  //             newOptions.push(opt?.value);
  //         })
  //         tempObj.options = newOptions;
  //     }
  //     newResponse.push(tempObj);
  // })
  // console.log(newResponse)

  // return formResponse; //---- This is the basic response to be returned.
  return newResponse;
}

export async function getAllSubmissionByUserId(user_id: string) {
  // get all responses from a user : output array
  const formResponses = await prisma.formResponse.findMany({
    where: {
      user_id,
    },
    select: {
      id: true,
      createdAt: true,
      form_id: true,
      FormResponseFields: {
        select: {
          field_id: true,
          response_value: true,
          FormResponseOptions: {
            select: {
              opt_id: true,
            },
          },
        },
      },
    },
  });
  // console.log(formResponses);

  // get all form Template of the forma: output array
  // ---extract all the formId's
  const id_array: string[] = [];
  formResponses.forEach((cur) => {
    id_array.push(cur.form_id);
  });

  // ---get all the formTemplates.
  const formTemplates = await getFormTemplates(id_array, user_id);

  // format all the responses
  // console.log(formTemplates);
  const responses = await ResponseFormatter(formTemplates, formResponses);

  return responses;
}

export async function deleteFormById(form_id: string) {
  return prisma.form.delete({
    where: {
      id: form_id,
    },
  });
}
