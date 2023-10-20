import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { Faculty } from '@prisma/client';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { facultyFilterableFields } from './faculty.constant';
import { FacultyService } from './faculty.service';

const createFaculty = catchAsync(async (req: Request, res: Response) => {
  const result = await FacultyService.createFaculty(req.body);

  sendResponse<Faculty>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty created successfully !',
    data: result,
  });
});

const getAllFaculties = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, facultyFilterableFields)
  const options = pick(req.query, paginationFields)
  const result = await FacultyService.getAllFaculties(filters, options);

  sendResponse<Faculty[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculties retrived successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleFaculty = catchAsync(async (req: Request, res: Response) => {
  const result = await FacultyService.getSingleFaculty(req.params.id);

  sendResponse<Faculty>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty retrived successfully !',
    data: result,
  });
});

const updateFaculty = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const data = req.body
  const result = await FacultyService.updateFaculty(id, data);

  sendResponse<Faculty>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty updated successfully !',
    data: result,
  });
});

const deleteFaculty = catchAsync(async (req: Request, res: Response) => {
  const result = await FacultyService.deleteFaculty(req.params.id);

  sendResponse<Faculty>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty deleted successfully !',
    data: result,
  });
});

const assignCourses = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body.courses;
  const result = await FacultyService.assignCourses(id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculty assigned successfully !',
    data: result,
  });
});

const removeCourses = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body.courses;
  const result = await FacultyService.removeCourses(id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculty removed successfully !',
    data: result,
  });
});

const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filters = pick(req.query, ['academicSemesterId', 'couresId'])
  const result = await FacultyService.getMyCourses(user, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faculty courses fetched successfully !',
    data: result,
  });
});

const getMyCourseStudents = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filters = pick(req.query, ['academicSemesterId', 'courseId', 'offeredCourseSectionId']);
  const options = pick(req.query, ['limit', 'page']);
  const result = await FacultyService.getMyCourseStudents(filters, options, user);
  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Faculty course students fetched successfully',
      meta: result.meta,
      data: result.data
  });
});

export const FacultyController = {
  createFaculty,
  getAllFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteFaculty,
  assignCourses,
  removeCourses,
  getMyCourses,
  getMyCourseStudents
};
