import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  bio: z.string(),
  image: z.string().nullable(),
});
export const userSelect: Prisma.UserSelect = {
  id: true,
  username: true,
  email: true,
  image: true,
  bio: true,
};

export const userRegistrationSchema = userSchema.pick({ username: true, email: true }).extend({ password: z.string() });
export const userLoginSchema = userSchema.pick({ email: true }).extend({ password: z.string() });
export const userTokenPayloadSchema = userSchema.pick({ id: true, email: true });
export const userUpdateSchema = userSchema.extend({ password: z.string() }).partial();

export type User = z.infer<typeof userSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
