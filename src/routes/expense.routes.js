import express from 'express';
import { createExpense, getExpenses, deleteExpense, getBalances, getSettlements } from '../controllers/expense.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { createExpenseBody, expenseIdParams } from '../validations/expenseValidation.js';
import { groupCodeParams } from '../validations/groupValidation.js';

const router = express.Router({ mergeParams: true });

// POST /api/groups/:code/expenses
router.post('/', validateRequest({ body: createExpenseBody, params: groupCodeParams }), createExpense);

// GET /api/groups/:code/expenses
router.get('/', validateRequest({ params: groupCodeParams }), getExpenses);

// DELETE /api/groups/:code/expenses/:expenseId
router.delete('/:expenseId', validateRequest({ params: expenseIdParams }), deleteExpense);

// GET /api/groups/:code/balances
router.get('/balances', validateRequest({ params: groupCodeParams }), getBalances);

// GET /api/groups/:code/settlements
router.get('/settlements', validateRequest({ params: groupCodeParams }), getSettlements);

export default router;
