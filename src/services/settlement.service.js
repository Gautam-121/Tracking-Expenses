import db from '../models/index.js';
import { getBalances } from './expense.service.js';
import { MESSAGES } from '../utils/constant.js';
import ApiError from '../utils/ApiError.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';
const { Group } = db;

const round = (value) => Math.round(value * 100) / 100;

export const getSettlements = async (groupCode) => {
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  const balanceData = await getBalances(groupCode);

  if (!balanceData.balances || balanceData.balances.length === 0) {
    return { groupName: group.name, message: MESSAGES.SETTLEMENT.ALL_SETTLED, transactions: [] };
  }

  // Separate into creditors (owed money) and debtors (owe money)
  const creditors = [];
  const debtors = [];

  balanceData.balances.forEach(({ participantId, name, balance }) => {
    if (balance > 0) creditors.push({ participantId, name, amount: balance });
    else if (balance < 0) debtors.push({ participantId, name, amount: Math.abs(balance) });
  });

  if (debtors.length === 0 || creditors.length === 0) {
    return { groupName: group.name, message: MESSAGES.SETTLEMENT.ALL_SETTLED, transactions: [] };
  }

  // Greedy algorithm — always match the biggest debtor with the biggest creditor
  // minimizes the total number of transactions
  const transactions = [];

  while (debtors.length > 0 && creditors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const creditor = creditors[0];
    const debtor = debtors[0];
    const settlement = round(Math.min(creditor.amount, debtor.amount));

    transactions.push({
      from: { participantId: debtor.participantId, name: debtor.name },
      to: { participantId: creditor.participantId, name: creditor.name },
      amount: settlement,
      description: `${debtor.name} pays ${creditor.name} ₹${settlement}`,
    });

    creditor.amount = round(creditor.amount - settlement);
    debtor.amount = round(debtor.amount - settlement);

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }

  return {
    groupName: group.name,
    groupCode: group.code,
    totalTransactions: transactions.length,
    transactions,
  };
};
