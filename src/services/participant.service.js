import db from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';
import { LIMITS, MESSAGES } from '../utils/constant.js';
const { Group, Participant } = db;

// ─── Add Participant to Group ─────────────────────────────────────────────────
export const addParticipant = async (groupCode, name) => {
  const normalizedName = name.toLowerCase();

  // Verify group exists and get its id
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  // Enforce participant cap before attempting insert
  const existingCount = await Participant.count({ where: { groupId: group.id } });
  if (existingCount >= LIMITS.MAX_PARTICIPANTS_PER_GROUP) {
    throw new ApiError(HttpStatusCode.BAD_REQUEST, MESSAGES.PARTICIPANT.LIMIT_EXCEEDED);
  }

  // Insert and let the DB unique constraint catch duplicate names (stored lowercase)
  try {
    const participant = await Participant.create({ groupId: group.id, name: normalizedName });
    return {
      id: participant.id,
      name: participant.name,
      groupId: participant.groupId,
      createdAt: participant.createdAt,
    };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new ApiError(HttpStatusCode.CONFLICT, MESSAGES.PARTICIPANT.ALREADY_EXISTS);
    }
    throw err;
  }
};

// ─── Rename Participant ───────────────────────────────────────────────────────
export const updateParticipant = async (groupCode, participantId, name) => {
  const normalizedName = name.toLowerCase();

  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  const participant = await Participant.findOne({ where: { id: participantId, groupId: group.id } });
  if (!participant) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.PARTICIPANT.NOT_FOUND);
  }

  try {
    await participant.update({ name: normalizedName });
    return { id: participant.id, name: participant.name, groupId: participant.groupId };
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new ApiError(HttpStatusCode.CONFLICT, MESSAGES.PARTICIPANT.ALREADY_EXISTS);
    }
    throw err;
  }
};

// ─── Get Participants of a Group ─────────────────────────────────────────────
export const getParticipants = async (groupCode) => {
  const group = await Group.findOne({ where: { code: groupCode } });
  if (!group) {
    throw new ApiError(HttpStatusCode.NOT_FOUND, MESSAGES.GROUP.NOT_FOUND);
  }

  const participants = await Participant.findAll({
    where: { groupId: group.id },
    attributes: ['id', 'name', 'createdAt'],
    order: [['createdAt', 'ASC']],
  });

  return {
    groupName: group.name,
    groupCode: group.code,
    totalParticipants: participants.length,
    remainingSlots: LIMITS.MAX_PARTICIPANTS_PER_GROUP - participants.length,
    participants,
  };
};
