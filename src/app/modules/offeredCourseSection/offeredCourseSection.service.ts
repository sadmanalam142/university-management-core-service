import { OfferedCourseSection, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IClassSchedule, IOfferedCourseSectionCreate, IOfferedCourseSectionFilters } from './offeredCourseSection.interface';
import { offeredCourseSectionSearchableFields } from './offeredCourseSection.constant';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { asyncForEach } from '../../../shared/utils';
import { OfferedCourseClassScheduleUtils } from '../offeredCourseClassSchedule/offeredCourseClassSchedule.utils';

const createOfferedCourseSection = async (payload: IOfferedCourseSectionCreate): Promise<OfferedCourseSection | null> => {

  const { classSchedules, ...data } = payload

  const isExistOfferedCourse = await prisma.offeredCourse.findFirst({
      where: {
          id: data.offeredCourseId
      }
  })

  if (!isExistOfferedCourse) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Offered Course does not exist!")
  }

  await asyncForEach(classSchedules, async (schedule: any) => {
      await OfferedCourseClassScheduleUtils.checkRoomAvailable(schedule)
      await OfferedCourseClassScheduleUtils.checkFacultyAvailable(schedule)
  });

  const offerCourseSectionData = await prisma.offeredCourseSection.findFirst({
      where: {
          offeredCourse: {
              id: data.offeredCourseId
          },
          title: data.title
      }
  });

  if (offerCourseSectionData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Course Section already exists")
  }

  const createSection = await prisma.$transaction(async (transactionClient) => {
      const createOfferedCourseSection = await transactionClient.offeredCourseSection.create({
          data: {
              title: data.title,
              maxCapacity: data.maxCapacity,
              offeredCourseId: data.offeredCourseId,
              semesterRegistrationId: isExistOfferedCourse.semesterRegistrationId
          }
      });

      const scheduleData = classSchedules.map((schedule: IClassSchedule) => ({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          dayOfWeek: schedule.dayOfWeek,
          roomId: schedule.roomId,
          facultyId: schedule.facultyId,
          offeredCourseSectionId: createOfferedCourseSection.id,
          semesterRegistrationId: isExistOfferedCourse.semesterRegistrationId
      }))

      await transactionClient.offeredCourseClassSchedule.createMany({
          data: scheduleData
      })

      return createOfferedCourseSection;
  });

  const result = await prisma.offeredCourseSection.findFirst({
      where: {
          id: createSection.id
      },
      include: {
          offeredCourse: {
              include: {
                  course: true
              }
          },
          offeredCourseClassSchedules: {
              include: {
                  room: {
                      include: {
                          building: true
                      }
                  },
                  faculty: true
              }
          }
      }
  });

  return result;
};

const getAllOfferedCourseSections = async (
  filters: IOfferedCourseSectionFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<OfferedCourseSection[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: offeredCourseSectionSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }
  if (Object.keys(filtersData).length) {
    andConditions.push({
      AND: Object.keys(filtersData).map(key => ({
        [key]: {
          equals: (filtersData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.OfferedCourseSectionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.offeredCourseSection.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
      offeredCourse: {
        include: {
          course: true,
        },
      },
    },
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.offeredCourseSection.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglOfferedCourseSection = async (
  id: string
): Promise<OfferedCourseSection | null> => {
  const result = await prisma.offeredCourseSection.findUnique({
    where: {
      id,
    },
    include: {
        offeredCourse: {
            include: {
                course: true
            }
        }
    },
  });
  return result;
};

const updatOfferedCourseSection = async (
  id: string,
  payload: Partial<OfferedCourseSection>
): Promise<OfferedCourseSection> => {
  const result = await prisma.offeredCourseSection.update({
    where: {
      id,
    },
    data: payload,
    include: {
        offeredCourse: {
            include: {
                course: true
            }
        }
    },
  });
  return result;
};

const deleteOfferedCourseSection = async (
  id: string
): Promise<OfferedCourseSection> => {
  const result = await prisma.offeredCourseSection.delete({
    where: {
      id,
    },
    include: {
        offeredCourse: {
            include: {
                course: true
            }
        }
    },
  });
  return result;
};

export const OfferedCourseSectionService = {
  createOfferedCourseSection,
  getAllOfferedCourseSections,
  getSinglOfferedCourseSection,
  updatOfferedCourseSection,
  deleteOfferedCourseSection,
};
