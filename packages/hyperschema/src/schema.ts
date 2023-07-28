import { z } from 'zod';

export const Human = z.object({
  name: z.string(),
  age: z.number().int(),
  pets: z.array(z.string()),
});

export type Human = z.infer<typeof Human>;
