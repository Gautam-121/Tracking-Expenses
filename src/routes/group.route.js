import express from 'express';
import { createGroup, getGroupByCode } from '../controllers/group.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { createGroupBody, groupCodeParams } from '../validations/groupValidation.js';

const router = express.Router();

// POST /api/groups
router.post('/', validateRequest({ body: createGroupBody }), createGroup);

// GET /api/groups/:code
router.get('/:code', validateRequest({ params: groupCodeParams }), getGroupByCode);

export default router;
