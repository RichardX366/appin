import { RequestHandler } from 'express';
import { prisma } from '..';
import { compareSync, hashSync } from 'bcryptjs';
import {
  idFromCookieToken,
  requireAuth,
  requireAuthLevel,
  signUser,
} from '../helpers/guards';
import { isInvalidEmail } from '../helpers/misc';
import { privateUser } from '../helpers/sanitize';

export const logIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    include: { xpUpdates: true },
  });

  if (!compareSync(password, user.password)) throw 'Invalid password';

  res.cookie('token', signUser(user.id), { maxAge: 3e10 });
  res.json(privateUser(user));
};

export const signUp: RequestHandler = async (req, res) => {
  const {
    email,
    name,
    password,
    address,
    notifications,
    bio,
    gender,
    phone,
    discord,
  } = req.body;

  if (isInvalidEmail(email)) throw 'Invalid email';
  if (password.length < 8) throw 'Password must be at least 8 characters';

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashSync(password),
      address,
      notifications,
      bio,
      gender,
      phone,
      discord,
    },
    include: {
      xpUpdates: true,
    },
  });

  res.cookie('token', signUser(user.id), { maxAge: 3e10 });
  res.json(privateUser(user));
};

export const updateUser: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (typeof id !== 'string') throw 'Invalid ID';
  try {
    requireAuth(req, id);
  } catch {
    await requireAuthLevel(req, 'ADMIN');
  }

  const { name, address, notifications, bio, gender, phone } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      address,
      notifications,
      bio,
      gender,
      phone,
    },
    include: {
      xpUpdates: true,
    },
  });

  res.json(privateUser(user));
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (typeof id !== 'string') throw 'Invalid ID';
  requireAuth(req, id);

  const user = await prisma.user.findUniqueOrThrow({ where: { id } });

  if (!compareSync(currentPassword, user.password)) {
    throw 'Invalid current password';
  }

  await prisma.user.update({
    where: { id },
    data: { password: hashSync(newPassword) },
  });

  res.json('success');
};

export const updateAuthLevel: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { authLevel } = req.body;

  if (typeof id !== 'string') throw 'Invalid ID';

  const requestAuthLevel = await prisma.user
    .findUniqueOrThrow({
      where: { id: idFromCookieToken(req) },
    })
    .then((user) => user.authLevel);

  if (requestAuthLevel === 'USER' || requestAuthLevel === 'MEMBER') {
    throw 'Unauthorized';
  }
  if (
    requestAuthLevel === 'OFFICER' &&
    (authLevel === 'ADMIN' || authLevel === 'OFFICER')
  ) {
    throw 'Unauthorized';
  }

  const user = await prisma.user.update({
    where: { id },
    data: { authLevel },
    include: { xpUpdates: true },
  });

  res.json(privateUser(user));
};
