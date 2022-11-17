// using type only imports the required functions and not the actual definitions or dependencies( if any), making it a faster import.

import type { FastifyReply, FastifyRequest } from "fastify";
import { server } from "../../app";
import { CreateUserInput, LoginUserInput } from "./user.schema";
import { create, findUserbyEmail, getAllUsers } from "./user.service";

export async function createUser(
request: FastifyRequest<{ Body: CreateUserInput }>, 
reply: FastifyReply) 
{
    const body = request.body;
    try{
        const user = await create(body);
        return reply.code(201).send(user)
    }catch(e){
        console.log(e);
        return reply.code(500).send();
    }
}

export async function loginHandler(
    request: FastifyRequest<{ Body: LoginUserInput }>, 
    reply: FastifyReply){
    
        const body = request.body;
        const {email, password} = request.body;
    
        // try catch block yet to bet set.
        const user = await findUserbyEmail(email);
        if(!user){
            return reply.code(404).send({
                message: "Invalid email or password"
            })
        }

        // if user exists check if password is correct using bcrypt
        const match = await server.bcrypt.compare(password, user.password);


        // generate access toke
        if(match){
            const {password, ...rest} = user;
            return { accessToken: server.jwt.sign(rest, { expiresIn: "1h" }) }
        }

        // else send a response
        return reply.code(401).send({
            message: "Invalid email or password"
        })
        



    
}

export async function getUsers(_request: FastifyRequest, reply: FastifyReply){
    try{
        const users = await getAllUsers();
        return reply.code(200).send(users);
    }catch(e){
        console.log(e);
        return reply.code(500).send();
    }
}