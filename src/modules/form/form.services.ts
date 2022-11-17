import prisma from "../../utils/prisma";
import { createFormInput } from "./form.schema";

export async function createForm(data: createFormInput) {

    const {fields, name, userId} = data;

    const form = await prisma.form.create({
        data: {
            name,
            userId: userId
    }
    });

    fields.forEach( async (cur) => {
        await prisma.field.create({
            data: {
                form_id: form.id,
                field_id: cur.field_id,
                type: cur.type,
                description: cur.description,
                Options: {
                    createMany: {
                        data: cur.options,
                    }
                }
            }
        })
    })

    return form;
}

export async function getAllForms(user_id: string){
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
                        field_id: 'asc',
                    }
                ],
                select: {
                    id: true,
                    field_id: true,
                    type: true,
                    description: true,
                    Options: {
                        orderBy: [
                            {
                                option_id: 'asc',
                            }
                        ],
                        select: {
                            value: true,
                        }
                    }
                }
            }
        }
    })
}

export async function getFormbyId(user_id: string, form_id: string){
    return await prisma.form.findMany({
        where: {
            userId: user_id,
            id: form_id
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
                        field_id: 'asc',
                    }
                ],
                select: {
                    id: true,
                    field_id: true,
                    type: true,
                    description: true,
                    Options: {
                        orderBy: [
                            {
                                option_id: 'asc',
                            }
                        ],
                        select: {
                            value: true,
                        }
                    }
                }
            }
        }
    })
}

export async function deleteFormById(form_id: string){
    return prisma.form.delete({
        where: {
            id: form_id
        }
    })
}