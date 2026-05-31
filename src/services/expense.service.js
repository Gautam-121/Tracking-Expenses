import { Op } from 'sequelize';
import db from '../models/index.js';
import sequelize from '../config/database.js';
import { LIMITS, MESSAGES } from '../utils/constant.js';
import ApiError from '../utils/ApiError.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';
const { Group, Participant, Expense, ExpenseParticipant } = db;

const round = (value) => Math.round(value * 100) / 100;

// ─── Create Expense ───────────────────────────────────────────────────────────
export const createExpense = async ({ groupCode, title, totalAmount, paidBy, splitType, participants, shares }) => {
    
  // Verify group exists
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  // Enforce expense cap
  const expenseCount = await Expense.count({ where: { groupId: group.id } });
  if (expenseCount >= LIMITS.MAX_EXPENSES_PER_GROUP) {
    throw new ApiError(HttpStatusCode.BAD_REQUEST, MESSAGES.EXPENSE.LIMIT_EXCEEDED);
  }

  // Verify payer belongs to this group
  const payer = await Participant.findOne({ where: { id: paidBy, groupId: group.id } });
  if (!payer) {
    throw new ApiError(HttpStatusCode.BAD_REQUEST, MESSAGES.EXPENSE.PAID_BY_NOT_IN_GROUP);
  }

  // Verify all participants belong to this group
  const groupParticipants = await Participant.findAll({
    where: { id: { [Op.in]: participants }, groupId: group.id },
  });
  if (groupParticipants.length !== participants.length) {
    throw new ApiError(HttpStatusCode.BAD_REQUEST, MESSAGES.EXPENSE.PARTICIPANT_NOT_IN_GROUP);
  }

  // Calculate shares (cross-field validation already done by Zod middleware)
  const amount = parseFloat(totalAmount);
  let computedShares = [];

  if (splitType === 'equal') {
    const baseShare = round(amount / participants.length);
    let totalDistributed = 0;
    computedShares = participants.map((participantId, index) => {
      const isLast = index === participants.length - 1;
      const share = isLast ? round(amount - totalDistributed) : baseShare;
      totalDistributed = round(totalDistributed + share);
      return { participantId, shareAmount: share };
    });
  } else {
    computedShares = Object.keys(shares).map((participantId) => ({
      participantId,
      shareAmount: round(parseFloat(shares[participantId])),
    }));
  }

  // Save expense and shares atomically
  const result = await sequelize.transaction(async (t) => {
    const expense = await Expense.create(
      { groupId: group.id, title: title.trim(), totalAmount: amount, paidBy: payer.id, splitType },
      { transaction: t }
    );

    await ExpenseParticipant.bulkCreate(
      computedShares.map((share) => ({
        expenseId: expense.id,
        participantId: share.participantId,
        shareAmount: share.shareAmount,
      })),
      { transaction: t }
    );

    return expense;
  });

  return {
    id: result.id,
    title: result.title,
    totalAmount: result.totalAmount,
    paidBy: { id: payer.id, name: payer.name },
    splitType: result.splitType,
    shares: computedShares,
    createdAt: result.createdAt,
  };
};

// ─── Get All Expenses ─────────────────────────────────────────────────────────
export const getExpenses = async (groupCode) => {
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  const expenses = await Expense.findAll({
    where: { groupId: group.id },
    include: [
      {
        model: Participant,
        as: 'payer',
        attributes: ['id', 'name'],
      },
      {
        model: ExpenseParticipant,
        as: 'shares',
        separate: true,
        include: [{ model: Participant, as: 'participant', attributes: ['id', 'name'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return {
    groupName: group.name,
    groupCode: group.code,
    totalExpenses: expenses.length,
    expenses,
  };
};

// ─── Delete Expense ───────────────────────────────────────────────────────────
export const deleteExpense = async (groupCode, expenseId) => {
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  const expense = await Expense.findOne({ where: { id: expenseId, groupId: group.id } });
  if (!expense) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.EXPENSE.NOT_FOUND);
  }

  // ExpenseParticipants cascade delete automatically
  await expense.destroy();
  return true;
};

// ─── Get Balances ─────────────────────────────────────────────────────────────
export const getBalances = async (groupCode) => {
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  const [expenses, participants] = await Promise.all([
    Expense.findAll({
      where: { groupId: group.id },
      include: [{ model: ExpenseParticipant, as: 'shares' }],
    }),
    Participant.findAll({ where: { groupId: group.id } }),
  ]);

  if (expenses.length === 0) {
    return { groupName: group.name, message: MESSAGES.BALANCE.NO_EXPENSES, balances: [] };
  }

  // Build balance map — start everyone at 0
  const balanceMap = {};
  participants.forEach((p) => { balanceMap[p.id] = 0; });

  expenses.forEach((expense) => {
    // payer gains the full amount they paid
    balanceMap[expense.paidBy] = round(balanceMap[expense.paidBy] + parseFloat(expense.totalAmount));
    // each participant loses their share
    expense.shares.forEach((share) => {
      balanceMap[share.participantId] = round(balanceMap[share.participantId] - parseFloat(share.shareAmount));
    });
  });

  const participantMap = {};
  participants.forEach((p) => { participantMap[p.id] = p.name; });

  const balances = Object.entries(balanceMap).map(([participantId, balance]) => ({
    participantId,
    name: participantMap[participantId],
    balance: round(balance),
    status:
      balance > 0
        ? `${participantMap[participantId]} is owed ₹${round(balance)}`
        : balance < 0
        ? `${participantMap[participantId]} owes ₹${Math.abs(round(balance))}`
        : `${participantMap[participantId]} is settled up`,
  }));

  return { groupName: group.name, groupCode: group.code, balances };
};
