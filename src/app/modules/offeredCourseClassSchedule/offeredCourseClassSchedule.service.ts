import { OfferedCourseClassSchedule, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { OfferedCourseClassScheduleUtils } from './offeredCourseClassSchedule.utils';
import { IOfferedCourseClassScheduleFilter } from './offeredCourseClassSchedule.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { offeredCourseClassScheduleRelationalFields, offeredCourseClassScheduleRelationalFieldsMapper, offeredCourseClassScheduleSearchableFields } from './offeredCourseClassSchedule.constant';
import { IGenericResponse } from '../../../interfaces/common';


const createOfferedCourseClassSchedule = async (
  payload: OfferedCourseClassSchedule
): Promise<OfferedCourseClassSchedule> => {
  await OfferedCourseClassScheduleUtils.checkRoomAvailable(payload);
  await OfferedCourseClassScheduleUtils.checkFacultyAvailable(payload)

  const result = prisma.offeredCourseClassSchedule.create({
    data: payload,
    include: {
      offeredCourseSection: true,
      semesterRegistration: true,
      room: true,
      faculty: true,
    },
  });
  return result;
};

const getAllOfferedCourseClassSchedules = async (
  filters: IOfferedCourseClassScheduleFilter,
  options: IPaginationOptions
): Promise<IGenericResponse<OfferedCourseClassSchedule[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  // Issue: searchTerm not working
  if (searchTerm) {
    andConditions.push({
        OR: offeredCourseClassScheduleSearchableFields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: 'insensitive'
            }
        }))
    });
}

if (Object.keys(filterData).length > 0) {
    andConditions.push({
        AND: Object.keys(filterData).map((key) => {
            if (offeredCourseClassScheduleRelationalFields.includes(key)) {
                return {
                    [offeredCourseClassScheduleRelationalFieldsMapper[key]]: {
                        id: (filterData as any)[key]
                    }
                };
            } else {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            }
        })
    });
}

  const whereConditions: Prisma.OfferedCourseClassScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.offeredCourseClassSchedule.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
        offeredCourseSection: true,
        semesterRegistration: true,
        room: true,
        faculty: true,
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

  const total = await prisma.offeredCourseClassSchedule.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglOfferedCourseClassSchedule = async (
  id: string
): Promise<OfferedCourseClassSchedule | null> => {
  const result = await prisma.offeredCourseClassSchedule.findUnique({
    where: {
      id,
    },
    include: {
        offeredCourseSection: true,
        semesterRegistration: true,
        room: true,
        faculty: true,
      },
  });
  return result;
};

const updatOfferedCourseClassSchedule = async (
  id: string,
  payload: Partial<OfferedCourseClassSchedule>
): Promise<OfferedCourseClassSchedule> => {
  const result = await prisma.offeredCourseClassSchedule.update({
    where: {
      id,
    },
    data: payload,
    include: {
        offeredCourseSection: true,
        semesterRegistration: true,
        room: true,
        faculty: true,
      },
  });
  return result;
};

const deleteOfferedCourseClassSchedule = async (id: string): Promise<OfferedCourseClassSchedule> => {
  const result = await prisma.offeredCourseClassSchedule.delete({
    where: {
      id,
    },
    include: {
        offeredCourseSection: true,
        semesterRegistration: true,
        room: true,
        faculty: true,
      },
  });
  return result;
};

export const OfferedCourseClassScheduleService = {
  createOfferedCourseClassSchedule,
  getAllOfferedCourseClassSchedules,
  getSinglOfferedCourseClassSchedule,
  updatOfferedCourseClassSchedule,
  deleteOfferedCourseClassSchedule
};
