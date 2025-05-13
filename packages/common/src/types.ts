import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateRoom = z.object({
  name: z.string(),
});
