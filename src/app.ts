import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import swagger from '@fastify/swagger';
import swagger_ui from '@fastify/swagger-ui';
import fastifyBcrypt from "fastify-bcrypt";
import fastifyJwt from "@fastify/jwt";

import { swaggerObject } from './utils/swagger';
import userRoutes from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";
import formRoutes from "./modules/form/form.route";
import { formSchemas } from "./modules/form/form.schema";


export const server = Fastify();

// module augmentation for typescript type validation: Validation.
declare module "fastify" {
    export interface FastifyInstance{
        authenticate: any,
    }
}

declare module "@fastify/jwt"{
    interface FastifyJWT{
        user: {
            id: string,
            email: string,
            name: string,
        }
    }
}

// register the jwt package and define the secret.
server.register(fastifyJwt, {
    secret: "Helloworld",
})

// decorator to set jwt function in the fastify instance
server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        await request.jwtVerify();
    }catch(err){
        reply.send(err)
    }
})  

// register bcrypt
server.register(fastifyBcrypt, {
    saltWorkFactor: 12
})
    

async function start(){

    // registering schemas to be available in the fastify instance.
    for( const schema of userSchemas){
        server.addSchema(schema)
    }

    for( const schema of formSchemas){
        server.addSchema(schema)
    }

    await server.register(require('@fastify/swagger'), swaggerObject);
    await server.register(swagger_ui);
    
    await server.register(userRoutes, {prefix: 'api/users'});
    await server.register(formRoutes, {prefix: 'api/forms'});
    
    try{
        await server.listen({ port: 3000, host: '0.0.0.0'});
        server.swagger();
        console.log("Server listening to http://localhost:3000");
    }catch(e){
        console.error(e);
        process.exit(1);
    }
}

start();