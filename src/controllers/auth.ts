import { AuthLevel } from '@prisma/client';
import { compareSync, hashSync } from 'bcryptjs';
import { RequestHandler } from 'express';
import { prisma } from '..';
import {
  getRefreshToken,
  requireAuth,
  requireAuthLevel,
  userFromRefreshToken,
  userToAccessToken,
} from '../helpers/guards';
import { isInvalidEmail } from '../helpers/misc';
import { privateUser, publicUser } from '../helpers/sanitize';

export const logIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    include: { xpUpdates: true },
  });

  if (!compareSync(password, user.password)) {
    throw new Error('Incorrect password!');
  }

  res.json({
    user: privateUser(user),
    access: userToAccessToken(user),
    refresh: getRefreshToken(user.id, password),
  });
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
    reasonForJoining,
    schoolCity,
    schoolName,
    talentsAndGoals,
    managementApplication,
    parentEmail,
    parentName,
    resumeLink,
  } = req.body;

  if (isInvalidEmail(email)) throw new Error('Invalid email');
  if (parentEmail && isInvalidEmail(parentEmail)) {
    throw new Error('Invalid parent email');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

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
      reasonForJoining,
      schoolCity,
      schoolName,
      talentsAndGoals,
      managementApplication,
      parentEmail,
      parentName,
      resumeLink,
    },
    include: {
      xpUpdates: true,
    },
  });

  res.json({
    user: privateUser(user),
    access: userToAccessToken(user),
    refresh: getRefreshToken(user.id, password),
  });
};

export const updateUser: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    requireAuth(req, id);
  } catch {
    requireAuthLevel(req, 'ADMIN');
  }

  const {
    email,
    name,
    address,
    notifications,
    bio,
    gender,
    phone,
    discord,
    reasonForJoining,
    schoolCity,
    schoolName,
    talentsAndGoals,
    managementApplication,
    parentEmail,
    parentName,
    resumeLink,
  } = req.body;

  if (isInvalidEmail(email)) throw new Error('Invalid email');
  if (parentEmail && isInvalidEmail(parentEmail)) {
    throw new Error('Invalid parent email');
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      email,
      name,
      address,
      notifications,
      bio,
      gender,
      phone,
      discord,
      reasonForJoining,
      schoolCity,
      schoolName,
      talentsAndGoals,
      managementApplication,
      parentEmail,
      parentName,
      resumeLink,
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

  requireAuth(req, id);

  const user = await prisma.user.findUniqueOrThrow({ where: { id } });

  if (!compareSync(currentPassword, user.password)) {
    throw new Error('Invalid current password');
  }

  await prisma.user.update({
    where: { id },
    data: { password: hashSync(newPassword) },
  });

  res.json({
    access: userToAccessToken(user),
    refresh: getRefreshToken(user.id, newPassword),
  });
};

export const updateAuthLevel: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const authLevel = req.body.authLevel as AuthLevel;

  requireAuthLevel(req, 'ADMIN');

  const user = await prisma.user.update({
    where: { id },
    data: { authLevel },
    include: { xpUpdates: true },
  });

  res.json(publicUser(user));
};

export const refreshToken: RequestHandler = async (req, res) => {
  const { token } = req.body;

  const user = await userFromRefreshToken(token);

  res.json(userToAccessToken(user));
};
