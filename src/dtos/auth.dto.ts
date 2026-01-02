import { z } from "zod";

export const registerDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
