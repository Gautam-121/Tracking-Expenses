import express from 'express';
import { addParticipant, getParticipants, updateParticipant } from '../controllers/participant.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { addParticipantBody, updateParticipantBody, participantIdParams } from '../validations/participantValidation.js';
import { groupCodeParams } from '../validations/groupValidation.js';

const router = express.Router({ mergeParams: true });

// POST /api/groups/:code/participants
router.post('/', validateRequest({ body: addParticipantBody, params: groupCodeParams }), addParticipant);

// GET /api/groups/:code/participants
router.get('/', validateRequest({ params: groupCodeParams }), getParticipants);

// PATCH /api/groups/:code/participants/:id
router.patch('/:id', validateRequest({ body: updateParticipantBody, params: participantIdParams }), updateParticipant);

export default router;
