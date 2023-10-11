import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SemesterRegistration } from '@prisma/client';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { SemesterRagistrationService } from './semesterRegistration.service';
import { semesterRegistrationFilterableFields } from './semesterRegistration.contant';

const createSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRagistrationService.createSemesterRegistration(req.body);

  sendResponse<SemesterRegistration>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester Registration created successfully !',
    data: result,
  });
});

const getAllSemesterRegistrations = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, semesterRegistrationFilterableFields)
  const options = pick(req.query, paginationFields)
  const result = await SemesterRagistrationService.getAllSemesterRegistrations(filters, options);

  sendResponse<SemesterRegistration[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester Registrations retrived successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRagistrationService.getSingleSemesterRegistration(req.params.id);

  sendResponse<SemesterRegistration>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester Registration retrived successfully !',
    data: result,
  });
});

const updateSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const data = req.body
  const result = await SemesterRagistrationService.updateSemesterRegistration(id, data);

  sendResponse<SemesterRegistration>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester Registration updated successfully !',
    data: result,
  });
});

const deleteSemesterRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRagistrationService.deleteSemesterRegistration(req.params.id);

  sendResponse<SemesterRegistration>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester Registration deleted successfully !',
    data: result,
  });
});

const createStartRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRagistrationService.createStartRegistration(user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester Registered successfully !',
    data: result,
  });
});

export const SemesterRagistrationController = {
  createSemesterRegistration,
  getAllSemesterRegistrations,
  getSingleSemesterRegistration,
  updateSemesterRegistration,
  deleteSemesterRegistration,
  createStartRegistration
};
