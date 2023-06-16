import { RequestHandler } from 'express';
import { prisma } from '..';

export const logIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });
  if (user.password === password) return res.json(user);
  throw 'Wrong password';
};

export const signUp: RequestHandler = async (req, res) => {
  res.json(
    await prisma.user.create({
      data: { ...req.body, city: { connect: { name: req.body.city } } },
    }),
  );
};
