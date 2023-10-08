import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OfferedCourseSection } from '@prisma/client';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { offeredCourseSectionFilterableFields } from './offeredCourseSection.constant';
import { OfferedCourseSectionService } from './offeredCourseSection.service';

const createOfferedCourseSection = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseSectionService.createOfferedCourseSection(req.body);

  sendResponse<OfferedCourseSection>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Section created successfully !',
    data: result,
  });
});

const getAllOfferedCourseSections = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, offeredCourseSectionFilterableFields)
  const options = pick(req.query, paginationFields)
  const result = await OfferedCourseSectionService.getAllOfferedCourseSections(filters, options);

  sendResponse<OfferedCourseSection[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Sections retrived successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglOfferedCourseSection = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseSectionService.getSinglOfferedCourseSection(req.params.id);

  sendResponse<OfferedCourseSection>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Section retrived successfully !',
    data: result,
  });
});

const updatOfferedCourseSection = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const data = req.body
  const result = await OfferedCourseSectionService.updatOfferedCourseSection(id, data);

  sendResponse<OfferedCourseSection>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Section updated successfully !',
    data: result,
  });
});

const deleteOfferedCourseSection = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseSectionService.deleteOfferedCourseSection(req.params.id);

  sendResponse<OfferedCourseSection>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Section deleted successfully !',
    data: result,
  });
});

export const OfferedCourseSectionController = {
  createOfferedCourseSection,
  getAllOfferedCourseSections,
  getSinglOfferedCourseSection,
  updatOfferedCourseSection,
  deleteOfferedCourseSection,
};
