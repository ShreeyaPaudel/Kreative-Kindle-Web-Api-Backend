import { z } from "zod";

export const registerDTO = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(["parent", "instructor"]).optional(), // admin should NOT be public signup
});

export const loginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
