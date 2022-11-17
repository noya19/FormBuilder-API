import { FastifyInstance } from "fastify";
// import path from "path";
// import { object, Schema, string } from "zod";
import { create, deleteForm, getform, getforms } from "./form.controller";
import { $ref } from "./form.schema";

async function formRoutes(server: FastifyInstance){
    server.post("/create", 
    {
        preValidation: function(req, reply, done) {
            const {fields} = req.body;
            fields.forEach( (cur) => {
                if(cur.type === 'string' || cur.type === 'number'){
                    cur.options = []
                }
            })
            done();
        },
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] },
            ],
            tags: ['Forms'],
            summary: 'Create a new Form',
            description: 'Creates a new Form',
            body: $ref('formInputSchema'),
            response: {
                201: $ref('responseFormSchema')
            }
        }
    },
    create);

    server.get("/getforms", 
    {
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] }
            ],
            tags: ['Forms'],
            summary: 'Get all forms',
            description: 'Fetches all Forms created by current User'
        }
    }
    , getforms)

    server.get("/:id", 
    {
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] }
            ],
            tags: ['Forms'],
            summary: 'Get a Form by ID',
            description: 'A form is fetched with unique ID',
            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'form id',
                    }
                }
            }
        }
    },
    getform)

    server.delete("/:id",
    {
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] }
            ],
            tags: ['Forms'],
            summary: 'Delete a form by id',
            description: 'An authenticated user can delete a form by required Id',
            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'form id',
                    }
                }
            }
        }

    },
    deleteForm)
}

export default formRoutes