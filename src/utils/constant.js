// utils/constants.js
const LIMITS = {
  MAX_PARTICIPANTS_PER_GROUP: 20,
  MAX_EXPENSES_PER_GROUP: 100,
  MIN_PARTICIPANTS_PER_EXPENSE: 2,
  GROUP_CODE_LENGTH: 6,
  MIN_EXPENSE_AMOUNT: 0.01,
  MAX_EXPENSE_AMOUNT: 999999.99,
};

const MESSAGES = {
  PARTICIPANT: {
    CREATED: 'Participant added successfully',
    UPDATED: 'Participant renamed successfully',
    FETCHED: 'Participants fetched successfully',
    NOT_FOUND: 'Participant not found',
    ALREADY_EXISTS: 'Participant with this name already exists in this group',
    LIMIT_EXCEEDED: `Group cannot have more than ${LIMITS.MAX_PARTICIPANTS_PER_GROUP} participants`,
    NAME_REQUIRED: 'Participant name is required',
    NAME_TOO_LONG: 'Participant name cannot exceed 50 characters',
  },
  GROUP: {
    NOT_FOUND: 'Group not found with this code',
    CREATED: 'Group created successfully',
    FETCHED: 'Group fetched successfully',
  },
  EXPENSE: {
    CREATED: 'Expense created successfully',
    FETCHED: 'Expenses fetched successfully',
    DELETED: 'Expense deleted successfully',
    NOT_FOUND: 'Expense not found',
    TITLE_REQUIRED: 'Expense title is required',
    INVALID_AMOUNT: `Amount must be between ${LIMITS.MIN_EXPENSE_AMOUNT} and ${LIMITS.MAX_EXPENSE_AMOUNT}`,
    PAID_BY_REQUIRED: 'PaidBy participant is required',
    PAID_BY_NOT_IN_GROUP: 'Payer must be a participant of this group',
    SPLIT_TYPE_INVALID: 'splitType must be either equal or unequal',
    PARTICIPANTS_REQUIRED: 'At least 2 participants are required',
    PARTICIPANT_NOT_IN_GROUP: 'One or more participants do not belong to this group',
    SHARES_REQUIRED: 'Shares are required for unequal split',
    SHARES_MISMATCH: 'Shares must cover all participants',
    SHARES_NOT_EQUAL_TOTAL: 'Sum of shares must equal total amount',
    LIMIT_EXCEEDED: `Group cannot have more than ${LIMITS.MAX_EXPENSES_PER_GROUP} expenses`,
  },
  BALANCE: {
    FETCHED: 'Balances fetched successfully',
    NO_EXPENSES: 'No expenses found for this group',
  },
  SETTLEMENT: {
    FETCHED: 'Settlements fetched successfully',
    ALL_SETTLED: 'Everyone is settled up. No transactions needed.',
  },
};

export { LIMITS, MESSAGES };