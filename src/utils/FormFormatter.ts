
export function format(form: any, fields: any) {
    const formatted: any = {};
    formatted['id'] = form.id;
    formatted['name'] = form.name;
    formatted['createdAt'] = form.createdAt;
    formatted['updatedAt'] = form.updatedAt;

    const hm = new Map();
    fields.forEach( (cur: any) => {
        const key = cur.field_ref_id;
        if( hm.has(cur.field_ref_id) === false){
            const obj:any = {};
            obj['id'] = cur.field_ref_id;
            obj['type'] = cur.type;
            obj['description'] = cur.description;
            obj['field_id'] = cur.fiedd_pos;
            if(cur.option_ref_id === null){
                obj['Options'] = []
            }else{
                const arr = [];
                const options = { 
                    "id": cur.option_ref_id,
                    "option_id": cur.option_id,
                    "value": cur.value
                }
                arr.push(options);
                obj['Options'] = arr;
            }
            
            // Put object in the hashmap.
            hm.set(cur.field_ref_id, obj);
        }
        else{
            const obj = hm.get(cur.field_ref_id);
            const options = { 
                    "id": cur.option_ref_id,
                    "option_id": cur.option_id,
                    "value": cur.value
            }
            obj.Options.push(options);
        }
    })

    let fields_final = Array.from(hm.values())
    formatted['Fields'] = fields_final;

    return formatted;
    
}

export function format_fields( fields: any) {
    const FormResponseFields: any[] = [];
    const newObj: any = {}

    const hm = new Map();
    fields.forEach( (cur: any) => {
        const key = cur.field_id;
        if( hm.has(cur.field_id) === false){
            const obj:any = {};
            obj['field_id'] = cur.field_id;
            if(cur.response_value !== 'undefined'){
                obj['response_value'] = cur.response_value;
                obj['FormResponseOptions'] = [];
            }else{
                obj['response_value'] = null;
                const arr = [];
                const options = { 
                    "opt_id": cur.opt_id,
                }
                arr.push(options);
                obj['FormResponseOptions'] = arr;
            }
            
            // Put object in the hashmap.
            hm.set(cur.field_id, obj);
        }
        else{
            const obj = hm.get(cur.field_id);
            const options = { 
                "opt_id": cur.opt_id,
            }
            obj.FormResponseOptions.push(options);
        }
    })

    let fields_final = Array.from(hm.values())
    newObj['FormResponseFields'] = fields_final;
    FormResponseFields.push(newObj);

    return FormResponseFields;
    
}