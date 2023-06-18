import type { User, AuthLevel, Gender, XpUpdate } from '@prisma/client';
import { exclude } from './exclude';

export type PrivateUser = Omit<
  User,
  'createdAt' | 'password' | 'emailVerificationCode'
> & {
  createdAt: string;
  xpUpdates: XpUpdate[];
};

export type PublicUser = {
  createdAt: string;
  email: string;
  name: string;
  gender: Gender;
  bio: string | null;
  discord: string | null;
  authLevel: AuthLevel;
  xp: number;
  xpUpdates: XpUpdate[];
};

export const privateUser = (
  user: User & { xpUpdates: XpUpdate[] },
): PrivateUser => ({
  ...exclude(user, 'password', 'emailVerificationCode'),
  createdAt: user.createdAt.toISOString(),
});

export const publicUserSelect = {
  email: true,
  createdAt: true,
  name: true,
  gender: true,
  bio: true,
  discord: true,
  authLevel: true,
  xp: true,
  xpUpdates: true,
};

export const publicUser = (
  user: User & { xpUpdates: XpUpdate[] },
): PublicUser => ({
  ...(Object.fromEntries(
    Object.entries(user).filter(([key]) =>
      Object.keys(publicUserSelect).includes(key),
    ),
  ) as PublicUser),
  createdAt: user.createdAt.toISOString(),
});
