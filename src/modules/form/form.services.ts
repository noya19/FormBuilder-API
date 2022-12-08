import prisma from "../../utils/prisma";
import { createFormInput } from "./form.schema";
import {
  getFormTemplates,
  ResponseFormatter,
} from "../../utils/formResponseFormatter";
import { v4 as uuid } from "uuid";
import { format, format_fields } from "../../utils/FormFormatter";

interface form {
  id: string;
  name: string;
  fields: Array<field>;
}

interface field{
  id: string,
  type: string,
  description: string,
  formId: string,
  field_id: string,
  options: Array<options>
}

interface options{
  id: string,
  option_id: string,
  value: string,
}


export async function createForm(data: createFormInput) {
  const { fields, name, userId } = data;

  const form: Array<form> = await prisma.$queryRawUnsafe(`INSERT into public."Form" (id, name, "userId")  VALUES ('${uuid()}', '${name}', '${userId}') RETURNING id, name`);

  const formId = form[0].id; // since $queryRaw returns an Array.


  for(let i=0; i<fields.length; i++){
    const cur = fields[i];
    const field: Array<field> =
      await prisma.$queryRawUnsafe(`INSERT INTO public."Field" (id, type,description,form_id,field_id) VALUES ('${uuid()}', '${cur.type}' , '${cur.description}', '${formId}', ${cur.field_id}) RETURNING id`);
    if(cur.options.length !== 0) {
       for( const opt of cur.options){
        await prisma.$queryRawUnsafe(`INSERT INTO public."Options" (id, option_id, value, field_id)
        VALUES ('${uuid()}', '${opt.option_id}', '${opt.value}', '${field[0].id}')`);
       }
    }
  } 

  return form[0];


  // fields.forEach(async (cur) => {

  //   const field: Array<field> =
  //     await prisma.$queryRawUnsafe(`INSERT INTO public."Field" (id, type,description,form_id,field_id) VALUES ('${uuid()}', '${cur.type}' , '${cur.description}', '${formId}', ${cur.field_id}) RETURNING id`);
  //     if(cur.options.length !== 0) {
  //     cur.options.forEach(async (opt) => {
        
  //     });
  //   }
  // });
}

export async function getAllForms(user_id: string) {

  const forms: Array<form> = await prisma.$queryRawUnsafe(`select * from "Form" fo where fo."userId" = '${user_id}';`);

  const allForms: Array<form> = [];
  for(let i=0; i<forms.length; i++){
      const cur = forms[i];
      const fields: Array<field> = await prisma.$queryRawUnsafe(`SELECT fe.id as field_ref_id, fe."type", fe.description , fe.form_id , fe.field_id as fiedd_pos, op.id as option_ref_id, op.option_id, op.value from "Field" fe  LEFT JOIN "Options" op on fe.id = op.field_id where fe.form_id = '${cur.id}' order by fe.field_id, op.option_id ;`);
      const formattedForm = format(cur, fields);
      allForms.push(formattedForm);
  }

  return allForms;
}

export async function getFormbyId(user_id: string, form_id: string) {
  const form: Array<form> = await prisma.$queryRawUnsafe(`select * from "Form" where id = '${form_id}' and "userId" = '${user_id}';`);
  const fields: Array<field> = await prisma.$queryRawUnsafe(`SELECT fe.id as field_ref_id, fe."type", fe.description , fe.form_id , fe.field_id as fiedd_pos, op.id as option_ref_id, op.option_id, op.value from "Field" fe  LEFT JOIN "Options" op on fe.id = op.field_id where fe.form_id = '${form[0].id}' order by fe.field_id, op.option_id;`);

  const formattedForm = format(form[0], fields);
  return formattedForm;
}

export async function deleteFormById(form_id: string) {
  /*Note you have to delete cascade. Set property in the table to delete casecade.
  Add Constraint to DB so that delete row is a cascade delete. ( This is done is the PgAdmin.)
  
  I used the following command to add constraint of cascade delete:-

  ALTER TABLE public."Form" drop constraint "Form_userId_fkey", ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE ON UPDATE CASCADE;*/
  
  return await prisma.$queryRawUnsafe(`delete from public."Form" where id = '${form_id}';`)

}


interface formResponseFieldInput{
  field_id: string,
  response_value: string,
  pos: number,
  options: Array<{ opt_id: string }>
}

// How Fields will look when fetched from a DB using a join.
interface formResponseFieldFetch{ 
  field_id: string,
  response_value: string,
  opt_id: string | null
}

export async function submitFormbyId(
  user_id: string,
  form_id: string,
  fields: Array<formResponseFieldInput>
) {
  
  // check if the form exits
  const form = await getFormbyId(user_id, form_id);
  if (form.length === 0) {
    return false;
  }

  // create a new response
  const formResponse: Array<{ id: string }> = await prisma.$queryRawUnsafe(`INSERT INTO public."FormResponse" (id, form_id, user_id) VALUES ('${uuid()}', '${form_id}', '${user_id}') RETURNING id`);


  const responseId = formResponse[0].id;


  // add all the fields with responseid referencing from the formResponse table.
  for (const cur of fields){
    const field: Array<{ id: string }> = await prisma.$queryRawUnsafe(`INSERT INTO public."FormResponseFields"(
      id, field_id, response_value, formresponse_id, field_order)
      VALUES ('${uuid()}', '${cur.field_id}', '${cur.response_value}', '${responseId}', ${cur.pos}) RETURNING id ;`)

    if(cur.options.length !== 0){
      for( const opt of cur.options){
        await prisma.$queryRawUnsafe(`INSERT INTO public."FormResponseOptions" (id, opt_id, formresponsefield_id) VALUES ('${uuid()}', '${opt.opt_id}', '${field[0].id}');`)
      }
    }
  }
  return formResponse[0];
}

export async function getSubmissionbyFormId(user_id: string, form_id: string) {
  // get the form template.
  const formTemplate = await getFormbyId(user_id, form_id);

  // get the form Response
  const formResponse: Array<{ id: string, createdAt: string}> = await prisma.$queryRawUnsafe(`select fr.id, fr."createdAt" from public."FormResponse" fr where fr.form_id = '${form_id}' and fr.user_id= '${user_id}';`);


  const cur = formResponse[0];
  const fields: Array<formResponseFieldFetch> = await prisma.$queryRawUnsafe(`select frf.field_id, frf.response_value, fro.opt_id from "FormResponseFields" frf left join "FormResponseOptions" fro ON frf.id = fro.formresponsefield_id where frf.formresponse_id = '${cur.id}' order by frf.field_order;`);
  
  
  // convert it to the desired Format
  const FormResponseFields: Array<{ 
      FormResponseFields: Array<
      { 
        field_id: string,
        response_value: string | null,
        FormResponseOptions: Array<{
          opt_id: string
        }>
      }
    >
  }> = format_fields(fields); 


  // merge the template and the response & Format the Response for the Output.
  const newResponse = await ResponseFormatter([formTemplate], FormResponseFields);


  return newResponse;
}

export async function getAllSubmissionByUserId(user_id: string) {
  // get all the Form Submissions made by a user
  
  const formResponse: Array<any> = await prisma.$queryRawUnsafe(`select fr.id, fr.form_id, fr."createdAt" from public."FormResponse" fr where 
  fr.user_id= '${user_id}';`);


  // Collect all the ResponseFields related to the above forms
  let fieldResponses: any[] = [];
  for(let i=0; i<formResponse.length; i++){
    const cur = formResponse[i];
    const fields: Array<any> = await prisma.$queryRawUnsafe(`select frf.field_id, frf.response_value, fro.opt_id from "FormResponseFields" frf left join "FormResponseOptions" fro ON frf.id = fro.formresponsefield_id where frf.formresponse_id = '${cur.id}' order by frf.field_order;`);
    const FormResponseFields: any[] = format_fields(fields);
    fieldResponses.push(FormResponseFields[0]);
  }



  // Get all the Form Templates.
  const FormTemplates: any[] = [];
  for(let i=0; i<formResponse.length; i++){
    const cur_form = formResponse[i];
    const formTemplate = await getFormbyId(user_id, cur_form.form_id);
    FormTemplates.push(formTemplate);
  }


  // merge the template and the response
  const newResponse = await ResponseFormatter(FormTemplates, fieldResponses);


  return newResponse;
}
