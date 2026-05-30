import { z } from 'zod';

export const createGroupBody = z.object({
  name: z
    .string({ required_error: 'Group name is required' })
    .min(1, 'Group name cannot be empty')
    .max(255, 'Group name must be between 1 and 255 characters')
    .trim(),
});

export const groupCodeParams = z.object({
  code: z
    .string({ required_error: 'Group code is required' })
    .min(4, 'Group code must be at least 4 characters')
    .max(20, 'Group code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Group code must be uppercase alphanumeric'),
});
