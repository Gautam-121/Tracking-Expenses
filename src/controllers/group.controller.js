import * as groupService from '../services/group.service.js';
import catchAsync from '../utils/catchAsync.js';
import { MESSAGES } from '../utils/constant.js';
import ApiResponse from '../utils/ApiResponse.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';

export const createGroup = catchAsync(async (req, res) => {
  const { name } = req.body;
  const group = await groupService.createGroup(name);
  res.status(HttpStatusCode.CREATED).json(
    new ApiResponse(HttpStatusCode.CREATED, group, MESSAGES.GROUP.CREATED)
  );
});

export const getGroupByCode = catchAsync(async (req, res) => {
  const { code } = req.params;
  const group = await groupService.getGroupByCode(code);
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(HttpStatusCode.OK, group, MESSAGES.GROUP.FETCHED)
  );
});
