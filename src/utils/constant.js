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
    FETCHED: 'Participants fetched successfully',
    NOT_FOUND: 'Participant not found',
    ALREADY_EXISTS: 'Participant with this name already exists in this group',
    LIMIT_EXCEEDED: `Group cannot have more than ${LIMITS.MAX_PARTICIPANTS_PER_GROUP} participants`,
    NAME_REQUIRED: 'Participant name is required',
    NAME_TOO_LONG: 'Participant name cannot exceed 50 characters',
  },
  GROUP: {
    CREATED: 'Group created successfully',
    FETCHED: 'Group fetched successfully',
    NOT_FOUND: 'Group not found with this code',
  },
};

export { LIMITS, MESSAGES };