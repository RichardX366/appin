import { RequestHandler } from 'express';
import { prisma } from '..';
import { requireAuthLevel } from '../helpers/guards';

export const xpUpdate: RequestHandler = async (req, res) => {
  const { user, reason, amount } = req.body;

  requireAuthLevel(req, 'OFFICER');

  const [xp] = await prisma.$transaction([
    prisma.xpUpdate.create({
      data: {
        user: {
          connect: {
            id: user,
          },
        },
        amount,
        reason,
      },
    }),
    prisma.user.update({
      where: { id: user },
      data: { xp: { increment: amount } },
    }),
  ]);

  res.json(xp);
};

export const deleteXpUpdate: RequestHandler = async (req, res) => {
  const { id } = req.params;

  requireAuthLevel(req, 'OFFICER');

  const xp = await prisma.xpUpdate.delete({ where: { id } });

  res.json(xp);
};
