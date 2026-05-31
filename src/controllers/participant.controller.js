import * as participantService from '../services/participant.service.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';
import { MESSAGES } from '../utils/constant.js';

export const addParticipant = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { name } = req.body;
  const participant = await participantService.addParticipant(code, name);
  res.status(HttpStatusCode.CREATED).json(
    new ApiResponse(HttpStatusCode.CREATED, participant, MESSAGES.PARTICIPANT.CREATED)
  );
});

export const updateParticipant = catchAsync(async (req, res) => {
  const { code, id } = req.params;
  const { name } = req.body;
  const participant = await participantService.updateParticipant(code, id, name);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, participant, MESSAGES.PARTICIPANT.UPDATED)
  );
});

export const getParticipants = catchAsync(async (req, res) => {
  const { code } = req.params;
  const data = await participantService.getParticipants(code);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, data, MESSAGES.PARTICIPANT.FETCHED)
  );
});
