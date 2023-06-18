import { RequestHandler } from 'express';
import { prisma } from '..';
import { requireAuth, requireAuthLevel } from '../helpers/guards';
import { privateUser, publicUser } from '../helpers/sanitize';

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
    if (user.private) throw 'User is private';
    res.json(publicUser(user));
  }
};
