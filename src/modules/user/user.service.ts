import prisma from "../../utils/prisma";
import { CreateUserInput } from "./user.schema";
import { server } from "../../app";
import { v4 as uuid } from "uuid";

interface user {
  id: string;
  email: string;
  name: string;
  password: string;
}

export async function create(data: CreateUserInput) {
  const { password, email, name } = data;
  const securePassword = await server.bcrypt.hash(password);

  const user: Array<user> = await prisma.$queryRaw`INSERT INTO public."User" 
    (id, email, name, password) VALUES (${uuid()}, ${email}, ${name}, ${securePassword})
    RETURNING id, email, name`;
    return user[0];
}

export async function findUserbyEmail(email: string) {
  const user: Array<user> =
    await prisma.$queryRaw`SELECT id, email, name, password FROM public."User" WHERE email = ${email}`;
  return user[0];
  // return prisma.user.findUnique({
  //   where: {
  //     email: email,
  //   },
  // });
}

export async function getAllUsers() {
  return await prisma.$queryRaw`SELECT id, email, name FROM public."User"`;
}
