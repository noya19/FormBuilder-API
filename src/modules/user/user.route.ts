import { FastifyInstance } from "fastify";
import { createUser, getUsers, loginHandler } from "./user.controller";
import { $ref } from "./user.schema";

async function userRoutes(server: FastifyInstance){
    server.post("/create", 
    {
        schema:{
            tags: ['User'],
            summary: 'Create a new User',
            description: 'Sign-Up a new user using email and password',
            body: $ref("createUserSchema"),
            response: {
                201: $ref("createUserSchemaResponse"),
            }
        }
    },
    createUser);

    server.post(
        "/login", 
        {
            schema: {
                tags: ['User'],
                summary: 'Log-In a User',
                description: 'Log-In user using email and password',
                body: $ref("loginSchema"),
            }
        }, 
    loginHandler)

    server.get("/getUser",
    {
        onRequest: [server.authenticate],
        schema: {
            security: [{
                bearerAuth: [],
            }],
            tags: ['User'],
            summary: 'Get All Users',
            description: 'Return the List of All Users',
            response: {
                201: $ref("createUserSchemaResponse"),
            }
        }
    },
    getUsers)
}

export default userRoutes;