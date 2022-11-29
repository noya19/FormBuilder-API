import { FastifyInstance } from "fastify";
// import path from "path";
// import { object, Schema, string } from "zod";
import { create, deleteForm, getAllSubmission, getform, getforms, getSubmission, submitform } from "./form.controller";
import { $ref } from "./form.schema";

async function formRoutes(server: FastifyInstance){
    server.post("/create", 
    {
        preValidation: function(req, _reply, done) {
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

    server.post("/submit/:id", 
    {
        preValidation: function(req, _reply, done) {
            const {fields} = req.body;
            fields.forEach( (cur) => {
                if(cur.options === undefined){
                    cur.options = []
                }
            })
            done();
        },
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] }
            ],
            tags: ['Submission'],
            summary: 'Submit a response for a form',
            description: 'An authenticated user can submit responses for a valid form',
            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'form id',
                    }
                }
            },
            body: $ref('submitFormSchema'),
        }    
    }, 
    submitform)

    server.get("/submissions/:id",
    {
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] }
            ],
            tags: ['Submission'],
            summary: 'Get submission of a form by id',
            description: 'An authenticated user can see their submissions for a form by required Id',
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
    getSubmission)

    server.get("/MySubmissions",
    {
        preHandler: [server.authenticate],
        schema: {
            security: [
                { bearerAuth: [] }
            ],
            tags: ['Submission'],
            summary: 'Get All submissions of a user',
            description: 'An authenticated user can see all their submissions'
        } 
    }, 
    getAllSubmission)
}

export default formRoutes