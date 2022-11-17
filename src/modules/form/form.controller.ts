import type { FastifyReply, FastifyRequest } from "fastify";
import { createForm, deleteFormById, getAllForms, getFormbyId } from "./form.services";
import { createFormInput, InputParamType } from "./form.schema";
export async function create(
    request: FastifyRequest<{ Body: createFormInput }>, 
    reply: FastifyReply)
{
    const body: any = request.body;
    const user_id = request.user.id;
    try{
        const form = await createForm({...body, userId: user_id});
        return reply.code(201).send(form);
    }catch(e){
        console.log(e);
        return reply.code(404).send();
    }

}

export async function getforms(request: FastifyRequest, reply: FastifyReply){
    try{
        const user_id = request.user.id;
        const forms = await getAllForms(user_id);
        return reply.code(200).send(forms);
    }catch(e){
        console.log(e);
        return reply.code(500).send();
    }
}

export async function getform(
    request: FastifyRequest<{
        Params: InputParamType
}>, reply: FastifyReply){
    try{
        const user_id = request.user.id;
        const { id } = request.params;
        const form = await getFormbyId(user_id, id);
        return reply.code(200).send(form);
    }catch(e){
        console.log(e);
        return reply.code(500).send();
    }
}

export async function deleteForm(request: FastifyRequest<{ Params: InputParamType }>, reply: FastifyReply) {
    try{
        // const user_id = request.user.id
        const { id } = request.params;
        await deleteFormById(id);

    }catch(e){
        console.log(e);
        return reply.code(500).send()
    }    
}