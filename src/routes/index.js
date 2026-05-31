import express from 'express';
const router = express.Router();

// Import route modules
import healthRouter from './health.route.js';
import groupRouter from './group.route.js';
import participantRoutes from './participant.routes.js';
import expenseRoutes from './expense.routes.js';

// Mount routes
router.use('/health', healthRouter);
router.use('/groups', groupRouter);
router.use('/groups/:code/participants', participantRoutes);
router.use('/groups/:code/expenses', expenseRoutes);


export default router;

