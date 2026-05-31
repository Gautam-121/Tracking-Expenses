import { z } from 'zod';
import { groupCodeParams } from './groupValidation.js';

export const addParticipantBody = z.object({
  name: z
    .string({ required_error: 'Participant name is required' })
    .min(1, 'Participant name cannot be empty')
    .max(255, 'Participant name must be between 1 and 255 characters')
    .trim(),
});

export const updateParticipantBody = z.object({
  name: z
    .string({ required_error: 'Participant name is required' })
    .min(1, 'Participant name cannot be empty')
    .max(255, 'Participant name must be between 1 and 255 characters')
    .trim(),
});

// params for PATCH /groups/:code/participants/:id
export const participantIdParams = groupCodeParams.extend({
  id: z.string().uuid('Invalid participant ID'),
});

export { groupCodeParams };

