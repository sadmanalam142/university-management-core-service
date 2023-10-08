import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OfferedCourseClassSchedule } from '@prisma/client';
import httpStatus from 'http-status';
import { OfferedCourseClassScheduleService } from './offeredCourseClassSchedule.service';
import { offeredCourseClassScheduleFilterableFields } from './offeredCourseClassSchedule.constant';
import { paginationFields } from '../../../constants/pagination';
import pick from '../../../shared/pick';

const createOfferedCourseClassSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OfferedCourseClassScheduleService.createOfferedCourseClassSchedule(
        req.body
      );

    sendResponse<OfferedCourseClassSchedule>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Offered Course Class Schedule created successfully !',
      data: result,
    });
  }
);

const getAllOfferedCourseClassSchedules = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, offeredCourseClassScheduleFilterableFields);
    const options = pick(req.query, paginationFields);
    const result =
      await OfferedCourseClassScheduleService.getAllOfferedCourseClassSchedules(
        filters,
        options
      );

    sendResponse<OfferedCourseClassSchedule[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Offered Course Class Schedules retrived successfully !',
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSinglOfferedCourseClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseClassScheduleService.getSinglOfferedCourseClassSchedule(req.params.id);

  sendResponse<OfferedCourseClassSchedule>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Class Schedule retrived successfully !',
    data: result,
  });
});

const updatOfferedCourseClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const data = req.body
  const result = await OfferedCourseClassScheduleService.updatOfferedCourseClassSchedule(id, data);

  sendResponse<OfferedCourseClassSchedule>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Class Schedule updated successfully !',
    data: result,
  });
});

const deleteOfferedCourseClassSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseClassScheduleService.deleteOfferedCourseClassSchedule(req.params.id);

  sendResponse<OfferedCourseClassSchedule>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course Class Schedule deleted successfully !',
    data: result,
  });
});

export const OfferedCourseClassScheduleController = {
  createOfferedCourseClassSchedule,
  getAllOfferedCourseClassSchedules,
  getSinglOfferedCourseClassSchedule,
  updatOfferedCourseClassSchedule,
  deleteOfferedCourseClassSchedule,
};
