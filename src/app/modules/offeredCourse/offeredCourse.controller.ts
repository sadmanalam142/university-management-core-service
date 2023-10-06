import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
// import { AcademicSemesterService } from './academicSemester.service';
import sendResponse from '../../../shared/sendResponse';
import { OfferedCourse } from '@prisma/client';
import httpStatus from 'http-status';
import { OfferedCourseService } from './offeredCourse.service';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { offeredCourseFilterableFields } from './offeredCourse.constant';
// import pick from '../../../shared/pick';
// import { academicSemesterFilterableFields } from './academicSemester.constant';
// import { paginationFields } from '../../../constants/pagination';

const createOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.createOfferedCourse(req.body);

  sendResponse<OfferedCourse[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course created successfully !',
    data: result,
  });
});

const getAllOfferedCourses = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, offeredCourseFilterableFields)
  const options = pick(req.query, paginationFields)
  const result = await OfferedCourseService.getAllOfferedCourses(filters, options);

  sendResponse<OfferedCourse[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Courses retrived successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.getSinglOfferedCourse(req.params.id);

  sendResponse<OfferedCourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course retrived successfully !',
    data: result,
  });
});

const updatOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const data = req.body
  const result = await OfferedCourseService.updatOfferedCourse(id, data);

  sendResponse<OfferedCourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course updated successfully !',
    data: result,
  });
});

const deleteOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.deleteOfferedCourse(req.params.id);

  sendResponse<OfferedCourse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course deleted successfully !',
    data: result,
  });
});

export const OfferedCourseController = {
  createOfferedCourse,
  getAllOfferedCourses,
  getSinglOfferedCourse,
  updatOfferedCourse,
  deleteOfferedCourse,
};
