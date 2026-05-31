import { z } from 'zod';
import { groupCodeParams } from './groupValidation.js';
import { LIMITS } from '../utils/constant.js';

export const createExpenseBody = z
  .object({
    title: z
      .string({ required_error: 'Expense title is required' })
      .min(1, 'Expense title cannot be empty')
      .max(255, 'Expense title must be between 1 and 255 characters')
      .trim(),
    totalAmount: z
      .number({ required_error: 'Total amount is required', invalid_type_error: 'Total amount must be a number' })
      .min(LIMITS.MIN_EXPENSE_AMOUNT, `Amount must be at least ${LIMITS.MIN_EXPENSE_AMOUNT}`)
      .max(LIMITS.MAX_EXPENSE_AMOUNT, `Amount must not exceed ${LIMITS.MAX_EXPENSE_AMOUNT}`),
    paidBy: z
      .string({ required_error: 'Paid by participant is required' })
      .uuid('paidBy must be a valid participant ID'),
    splitType: z.enum(['equal', 'unequal'], {
      required_error: 'Split type is required',
      invalid_type_error: 'Split type must be either equal or unequal',
    }).default('equal'),
    participants: z
      .array(z.string().uuid('Each participant must be a valid ID'))
      .min(LIMITS.MIN_PARTICIPANTS_PER_EXPENSE, `At least ${LIMITS.MIN_PARTICIPANTS_PER_EXPENSE} participants are required`),
    shares: z
      .record(z.string(), z.number().min(0.01, 'Each share must be greater than 0'))
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Payer must be in the participants list
    if (!data.participants.includes(data.paidBy)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Payer must be included in the participants list',
        path: ['paidBy'],
      });
      return;
    }

    if (data.splitType !== 'unequal') return;

    // shares object is required for unequal split
    if (!data.shares || Object.keys(data.shares).length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Shares are required for unequal split', path: ['shares'] });
      return;
    }

    const shareKeys = Object.keys(data.shares);

    // shares must cover exactly the same participants
    const allCovered =
      shareKeys.length === data.participants.length &&
      data.participants.every((id) => shareKeys.includes(id));

    if (!allCovered) {
      ctx.addIssue({ code: 'custom', message: 'Shares must cover exactly the same participants', path: ['shares'] });
      return;
    }

    // shares must sum to totalAmount
    const round = (v) => Math.round(v * 100) / 100;
    const sharesSum = round(shareKeys.reduce((sum, id) => sum + data.shares[id], 0));
    if (sharesSum !== data.totalAmount) {
      ctx.addIssue({
        code: 'custom',
        message: `Sum of shares must equal total amount. Expected ${data.totalAmount}, got ${sharesSum}`,
        path: ['shares'],
      });
    }
  });

export const expenseIdParams = groupCodeParams.extend({
  expenseId: z.string().uuid('Invalid expense ID'),
});
