import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { CourseService } from './course.servise';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course created successfully !',
    data: result,
  });
});


const updateCourse = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id
    const data = req.body
  const result = await CourseService.updateCourse(id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course updated successfully !',
    data: result,
  });
});


export const CourseController = {
    createCourse,
    updateCourse
};
