import { getFormbyId } from "../modules/form/form.services";

export async function getFormTemplates(id_array: string[], user_id: string) {
  const alltemplates: any[] = [];
  for (let i = 0; i < id_array.length; i++) {
    const form = await getFormbyId(user_id, id_array[0]);
    alltemplates.push(form[0]); // because getForm returns an array ( might have to change this logic)
  }
  return alltemplates;
}
export async function ResponseFormatter(
  formTemplate: any[],
  formResponse: any[]
) {
  const allResponses = [];
  for (let i = 0; i < formTemplate.length; i++) {
    const field_template: any[] = formTemplate[i].Fields;
    const fieldResponse_template: any[] = formResponse[i].FormResponseFields;

    // console.log(field_template);
    // console.log(fieldResponse_template);

    const obj: any = {};

    obj.name = formTemplate[i].name;
    const newResponse: any[] = [];
    field_template.forEach((cur, i) => {
      console.log(cur);
      const tempObj: any = {};
      tempObj.description = cur.description;
      if (
        fieldResponse_template[i].response_value !== 'undefined' &&
        fieldResponse_template[i].FormResponseOptions === null
      ) {
        tempObj.response_value = fieldResponse_template[i].response_value;
      } else if (
        fieldResponse_template[i].response_value === 'undefined' &&
        fieldResponse_template[i].FormResponseOptions !== null
      ) {
        const newOptions: any[] = [];
        const options: any[] = fieldResponse_template[i].FormResponseOptions;
        console.log(options);
        options.forEach((ele) => {
          const opt = cur.options.find(
            (obj: { id: any }) => obj.id === ele.opt_id
          );
          newOptions.push(opt?.value);
        });
        tempObj.options = newOptions;
      }
      newResponse.push(tempObj);
    });
    obj.response = newResponse;
    allResponses.push(obj);
  }

  return allResponses;
}
