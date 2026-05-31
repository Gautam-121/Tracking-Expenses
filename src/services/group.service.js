import db from '../models/index.js';
import { customAlphabet } from 'nanoid';
import { MESSAGES } from '../utils/constant.js';
import ApiError from '../utils/ApiError.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';
const { Group, Participant, Expense } = db;

// Generate a unique 8-character alphanumeric code for groups
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

// ─── Create Group ─────────────────────────────────────────────────────────────
export const createGroup = async (name) => {
  let group = null;
  while (!group) {
    try {
      group = await Group.create({ name, code: generateCode() });
    } catch (err) {
      if (err.name !== 'SequelizeUniqueConstraintError') throw err;
    }
  }

  return group;
};

// ─── Get Group by Code ───────────────────────────────────────────────────────
export const getGroupByCode = async (code) => {
  const group = await Group.findOne({
    where: { code },
    include: [
      {
        model: Participant,
        as: 'participants',
        attributes: ['id', 'name'],
        separate: true,
        order: [['name', 'ASC']],
      },
      {
        model: Expense,
        as: 'expenses',
        attributes: ['id', 'title', 'total_amount', 'paid_by', 'split_type', 'created_at'],
        separate: true,
        order: [['created_at', 'DESC']],
      },
    ],
  });

  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND,  MESSAGES.GROUP.NOT_FOUND);
  }

  return group;
};
