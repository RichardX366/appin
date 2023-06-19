import { RequestHandler } from 'express';
import { paginate, prisma } from '..';
import { requireAuth, requireAuthLevel } from '../helpers/guards';
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
      await requireAuthLevel(req, 'ADMIN');
    }
    res.json(privateUser(user));
  } catch {
    res.json(publicUser(user));
  }
};

export const fetchUsers: RequestHandler = async (req, res) => {
  const { name, level } = req.stringQuery;

  res.json(
    await paginate(req.stringQuery, 'user', {
      where: {
        name: { contains: name },
        authLevel: level || undefined,
      },
      select: { ...publicUserSelect, xpUpdates: false },
    } as Prisma.UserFindManyArgs),
  );
};
