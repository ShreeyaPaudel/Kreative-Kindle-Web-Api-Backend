import { z } from "zod";

export const createChildDTO = z.object({
  name: z.string().min(1, "Name is required"),
  age:  z.number().min(1).max(12),
  avatar: z.string().optional(),
});

export const updateChildDTO = z.object({
  name:   z.string().min(1).optional(),
  age:    z.number().min(1).max(12).optional(),
  avatar: z.string().optional(),
});

export type CreateChildDTO = z.infer<typeof createChildDTO>;
export type UpdateChildDTO = z.infer<typeof updateChildDTO>;