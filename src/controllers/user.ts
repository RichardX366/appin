import { RequestHandler } from 'express';
import { paginate, prisma } from '..';
import {
  errorIsAccessTokenExpiration,
  requireAuth,
  requireAuthLevel,
} from '../helpers/guards';
import { privateUser, publicUser, publicUserSelect } from '../helpers/sanitize';
import { Prisma } from '@prisma/client';

export const fetchUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: { xpUpdates: true },
  });

  try {
    try {
      requireAuth(req, id);
    } catch {
      requireAuthLevel(req, 'ADMIN');
    }
    res.json(privateUser(user));
  } catch (e) {
    if (errorIsAccessTokenExpiration(e)) throw e;
    res.json(publicUser(user));
  }
};

export const fetchUsers: RequestHandler = async (req, res) => {
  const { name, email, query, level } = req.stringQuery;

  res.json(
    await paginate(req.stringQuery, 'user', {
      where: {
        name: { contains: query || name },
        email: { contains: query || email },
        authLevel: level || undefined,
      },
      select: { ...publicUserSelect, xpUpdates: false },
    } as Prisma.UserFindManyArgs),
  );
};
