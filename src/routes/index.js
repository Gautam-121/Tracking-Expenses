import express from 'express';
const router = express.Router();

// Import route modules
import healthRouter from './health.route.js';
import groupRouter from './group.route.js';

router.use('/health', healthRouter);
router.use('/groups', groupRouter);

export default router;

