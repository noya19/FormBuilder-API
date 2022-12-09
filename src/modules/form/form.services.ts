import prisma from "../../utils/prisma";
import { createFormInput } from "./form.schema";
import {
  getFormTemplates,
  ResponseFormatter,
} from "../../utils/formResponseFormatter";
import { v4 as uuid } from "uuid";

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

export async function getFormbyId(user_id: string, form_id: string) {
  // const form: Array<form> = await prisma.$queryRawUnsafe(`select * from "Form" where id = '${form_id}' and "userId" = '${user_id}';`);
  // const fields: Array<field> = await prisma.$queryRawUnsafe(`SELECT fe.id as field_ref_id, fe."type", fe.description , fe.form_id , fe.field_id as fiedd_pos, op.id as option_ref_id, op.option_id, op.value from "Field" fe  LEFT JOIN "Options" op on fe.id = op.field_id where fe.form_id = '${form[0].id}' order by fe.field_id, op.option_id;`);

  // const formattedForm = format(form[0], fields);
  // return formattedForm;


  
  const form: any[] = await prisma.$queryRawUnsafe(`with form_input as (
    select '${form_id}' as input_id
  ),
  t1 as (
    select field.form_id ,field.id as p_opt_id, field."type" , field.description , field.field_id as field_pos from form_input, public."Field" field where field.form_id=form_input.input_id order by field.field_id
  ),
  tbl_opt as (
    select opt.field_id, jsonb_agg(json_build_object(
      'id', opt.id,
      'option_id', opt.option_id,
      'value', opt.value,
      'field_id', opt.field_id 
    ) ) as option_obj from (select * from t1,public."Options" opt where opt.field_id = t1.p_opt_id order by opt.option_id) opt group by opt.field_id
  ),
  t2 as (
    select field.form_id , json_agg(json_build_object( 
      'id', field.p_opt_id,
      'type', field."type",
      'description', field.description,
      'field_id', field.field_pos, 
      'options',(select tbl_opt.option_obj from tbl_opt where tbl_opt.field_id=field.p_opt_id ) 
    )) as field_obj from t1 field group by field.form_id 
  )
  select  
  json_build_object(
    'form_id', form.id,
    'name', form."name",
    'createdAt', form."createdAt",
    'updatedAt', form."updatedAt", 
    'Fields', (select t2.field_obj from t2 where t2.form_id = form.id)
  ) from public."Form" form, form_input  where form.id= form_input.input_id and form."userId" = '${user_id}';`);

  return form;
}

export async function getAllForms(user_id: string) {

  // const forms: Array<form> = await prisma.$queryRawUnsafe(`select * from "Form" fo where fo."userId" = '${user_id}';`);

  // const allForms: Array<form> = [];
  // for(let i=0; i<forms.length; i++){
  //     const cur = forms[i];
  //     const fields: Array<field> = await prisma.$queryRawUnsafe(`SELECT fe.id as field_ref_id, fe."type", fe.description , fe.form_id , fe.field_id as fiedd_pos, op.id as option_ref_id, op.option_id, op.value from "Field" fe  LEFT JOIN "Options" op on fe.id = op.field_id where fe.form_id = '${cur.id}' order by fe.field_id, op.option_id ;`);
  //     const formattedForm = format(cur, fields);
  //     allForms.push(formattedForm);
  // }

  // return allForms;

  const forms = await prisma.$queryRawUnsafe(`with t1 as (
    select opt.field_id, jsonb_agg(json_build_object(
        'id', opt.id,
        'option_id', opt.option_id,
        'value', opt.value,
        'field_id', opt.field_id 
      ) ) as option_obj from (select * from public."Options" opt order by opt.option_id) opt group by opt.field_id
    ) ,
    t2 as (
      select field.form_id , json_agg(json_build_object( 
        'id', field.id,
        'type', field."type",
        'description', field.description,
        'field_id', field.field_id, 
        'options',(select t1.option_obj from t1 where t1.field_id=field.id )  
      )) as field_obj from (select * from public."Field" field order by field.field_id) field group by field.form_id 
    )
    select  
    json_build_object(
      'form_id', form.id,
      'name', form."name",
      'createdAt', form."createdAt",
      'updatedAt', form."updatedAt", 
      'Fields',(select t2.field_obj from t2 where t2.form_id = form.id)
    ) from public."Form" form where form."userId"  = '${user_id}';
    `)

     return forms;
}

export async function deleteFormById(form_id: string) {
  /*Note you have to delete cascade. Set property in the table to delete casecade.
  Add Constraint to DB so that delete row is a cascade delete. ( This is done is the PgAdmin.)
  
  I used the following command to add constraint of cascade delete:-

  ALTER TABLE public."Form" drop constraint "Form_userId_fkey", ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE ON UPDATE CASCADE;*/
  
  return await prisma.$queryRawUnsafe(`delete from public."Form" where id = '${form_id}';`)

}


// interface formResponseFieldInput{
//   field_id: string,
//   response_value?: string | undefined,
//   pos: number,
//   options: Array<{ opt_id: string }>
// }

// How Fields will look when fetched from a DB using a join.
interface formResponseFieldFetch{ 
  field_id: string,
  response_value: string,
  opt_id: string | null
}

export async function submitFormbyId(
  user_id: string,
  form_id: string,
  fields: Array<any>
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
  // // get the form template.
  // const formTemplate = await getFormbyId(user_id, form_id);

  // // get the form Response
  // const formResponse: Array<{ id: string, createdAt: string}> = await prisma.$queryRawUnsafe(`select fr.id, fr."createdAt" from public."FormResponse" fr where fr.form_id = '${form_id}' and fr.user_id= '${user_id}';`);


  // const cur = formResponse[0];
  // const fields: Array<formResponseFieldFetch> = await prisma.$queryRawUnsafe(`select frf.field_id, frf.response_value, fro.opt_id from "FormResponseFields" frf left join "FormResponseOptions" fro ON frf.id = fro.formresponsefield_id where frf.formresponse_id = '${cur.id}' order by frf.field_order;`);
  
  
  // // convert it to the desired Format
  // const FormResponseFields: Array<{ 
  //     FormResponseFields: Array<
  //     { 
  //       field_id: string,
  //       response_value: string | null,
  //       FormResponseOptions: Array<{
  //         opt_id: string
  //       }>
  //     }
  //   >
  // }> = format_fields(fields); 

  // return FormResponseFields;

  // // merge the template and the response & Format the Response for the Output.
  // const newResponse = await ResponseFormatter([formTemplate], FormResponseFields);


  // return newResponse;

   // get the form template.

  const formTemplate = await getFormbyId(user_id, form_id);
  const formResponse: any[] = await prisma.$queryRawUnsafe(`with t1 as (
    select fro.formresponsefield_id , jsonb_agg(json_build_object(
        'opt_id', fro.opt_id 
      ) ) as option_obj from public."FormResponseOptions" fro group by fro.formresponsefield_id 
    )
    select  
    json_build_object(
      'FormResponseFields',json_agg(json_build_object( 
        'field_id', frf.field_id ,
        'response_value', frf.response_value,
        'FormResponseOptions', (select t1.option_obj from t1 where t1.formresponsefield_id=frf.id )  
      ))
    ) from public."FormResponse" fr join public."FormResponseFields" frf on fr.id = frf.formresponse_id 
    group by fr.id 
    having fr.form_id = '${form_id}' and fr.user_id = '${user_id}';`)

    const newResponse =  await ResponseFormatter([formTemplate[0].json_build_object],[formResponse[0].json_build_object])

    // return formTemplate;
    return newResponse;
}

export async function getAllSubmissionByUserId(user_id: string) {
  // get all the Form Submissions made by a user
  
  // const formResponse: Array<any> = await prisma.$queryRawUnsafe(`select fr.id, fr.form_id, fr."createdAt" from public."FormResponse" fr where 
  // fr.user_id= '${user_id}';`);


  // Collect all the ResponseFields related to the above forms
  // let fieldResponses: any[] = [];
  // for(let i=0; i<formResponse.length; i++){
  //   const cur = formResponse[i];
  //   const fields: Array<any> = await prisma.$queryRawUnsafe(`select frf.field_id, frf.response_value, fro.opt_id from "FormResponseFields" frf left join "FormResponseOptions" fro ON frf.id = fro.formresponsefield_id where frf.formresponse_id = '${cur.id}' order by frf.field_order;`);
  //   const FormResponseFields: any[] = format_fields(fields);
  //   fieldResponses.push(FormResponseFields[0]);
  // }



  // // Get all the Form Templates.
  // const FormTemplates: any[] = [];
  // for(let i=0; i<formResponse.length; i++){
  //   const cur_form = formResponse[i];
  //   const formTemplate = await getFormbyId(user_id, cur_form.form_id);
  //   FormTemplates.push(formTemplate);
  // }


  // // merge the template and the response
  // const newResponse = await ResponseFormatter(FormTemplates, fieldResponses);


  // get all the form Submissions made by a user
  const formResponses: Array<any> = await prisma.$queryRawUnsafe(`with t1 as (
    select fro.formresponsefield_id , jsonb_agg(json_build_object(
        'opt_id', fro.opt_id 
      ) ) as option_obj from public."FormResponseOptions" fro group by fro.formresponsefield_id 
    )
    select  
    json_build_object(
      'form_id', fr.form_id,
      'FormResponseFields',json_agg(json_build_object( 
        'field_id', frf.field_id ,
        'response_value', frf.response_value,
        'FormResponseOptions', (select t1.option_obj from t1 where t1.formresponsefield_id=frf.id )  
      ))
    ) from public."FormResponse" fr join public."FormResponseFields" frf on fr.id = frf.formresponse_id 
    group by fr.id 
    having fr.user_id = '${user_id}';`);


  // The current query returns in a format where each object starts with json_build_object, so to convert it to a desirable format the below code is made.

  const formResponses_format = formResponses.map( (cur) => { return cur.json_build_object })  

  // // Get all the Form Templates.
  // So I am using a for loop here instead of directly calling get allForms because for the Formatter the ordering of the Form and the Submissions is importand
  const FormTemplates: any[] = [];
  for(let i=0; i<formResponses_format.length; i++){
    const cur_form = formResponses_format[i];
    const formTemplate = await getFormbyId(user_id, cur_form.form_id);
    FormTemplates.push(formTemplate[0].json_build_object);
  }  

   // merge the template and the response
  const newResponse = await ResponseFormatter(FormTemplates, formResponses_format);

  // return formResponses_format;
  return newResponse;
}
