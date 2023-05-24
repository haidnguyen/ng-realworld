import { Prisma } from '@prisma/client';

const userBaseSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  email: true,
  image: true,
  bio: true,
};

export const userSelect: Prisma.UserSelect = userBaseSelect;

export const authorSelect: Prisma.UserSelect = {
  ...userBaseSelect,
  articles: {
    include: {
      author: {
        select: userBaseSelect,
      },
      tags: true,
    },
  },
};
