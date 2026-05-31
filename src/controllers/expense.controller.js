import * as expenseService from '../services/expense.service.js';
import * as settlementService from '../services/settlement.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';
import { MESSAGES } from '../utils/constant.js';

export const createExpense = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { title, totalAmount, paidBy, splitType, participants, shares } = req.body;
  const expense = await expenseService.createExpense({ groupCode: code, title, totalAmount, paidBy, splitType, participants, shares });
  res.status(HttpStatusCode.CREATED).json(
    new ApiResponse(HttpStatusCode.CREATED, expense, MESSAGES.EXPENSE.CREATED)
  );
});

export const getExpenses = catchAsync(async (req, res) => {
  const { code } = req.params;
  const data = await expenseService.getExpenses(code);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, data, MESSAGES.EXPENSE.FETCHED)
  );
});

export const deleteExpense = catchAsync(async (req, res) => {
  const { code, expenseId } = req.params;
  await expenseService.deleteExpense(code, expenseId);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, null, MESSAGES.EXPENSE.DELETED)
  );
});

export const getBalances = catchAsync(async (req, res) => {
  const { code } = req.params;
  const data = await expenseService.getBalances(code);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, data, MESSAGES.BALANCE.FETCHED)
  );
});

export const getSettlements = catchAsync(async (req, res) => {
  const { code } = req.params;
  const data = await settlementService.getSettlements(code);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, data, MESSAGES.SETTLEMENT.FETCHED)
  );
});
