import { Request } from 'express';
import { prisma } from '..';
import { AuthLevel } from '@prisma/client';
import { sign, verify } from 'jsonwebtoken';

export const idFromCookieToken = (req: Request) => {
  const token = req.cookies.token;
  if (!token) {
    throw new Error('You must be logged in to do this.');
  }
  return verifyToken(token);
};

export const requireAuth = (req: Request, idMatch: string) => {
  const id = idFromCookieToken(req);
  if (id !== idMatch) {
    throw new Error('You must be logged into the correct account do this.');
  }
};

export const requireAuthLevel = async (req: Request, level: AuthLevel) => {
  const id = idFromCookieToken(req);
  const authLevel = authLevelToNumber(
    (
      await prisma.user.findUniqueOrThrow({
        where: { id },
      })
    ).authLevel,
  );
  if (authLevel < authLevelToNumber(level)) {
    throw new Error('You must be of a higher level to do this.');
  }
};

export const signUser = (id: string) =>
  sign(id, process.env.JWT_SECRET as string);

export const verifyToken = (token: string) =>
  verify(token, process.env.JWT_SECRET as string) as string;

export const authLevelToNumber = (level: AuthLevel): number =>
  Object.keys(AuthLevel).indexOf(level);
