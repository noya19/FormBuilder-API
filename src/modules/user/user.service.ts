import prisma from "../../utils/prisma";
import { CreateUserInput } from "./user.schema";
import { server } from "../../app";

export async function create(data: CreateUserInput) {
  const { password, ...rest } = data;
  const securePassword = await server.bcrypt.hash(password);

  const user = await prisma.user.create({
    data: { ...rest, password: securePassword },
  });
  return user;
}

export async function findUserbyEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      id: true,
    },
  });
}
