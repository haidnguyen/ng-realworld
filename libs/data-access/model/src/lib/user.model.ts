import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  username: z.string(),
  bio: z.string(),
  image: z.string(),
});

export const userRegistrationSchema = userSchema.pick({ username: true, email: true }).extend({ password: z.string() });
export const userLoginSchema = userSchema.pick({ email: true }).extend({ password: z.string() });
export const userTokenPayloadSchema = userSchema.pick({ id: true, email: true });

export type User = z.infer<typeof userSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
