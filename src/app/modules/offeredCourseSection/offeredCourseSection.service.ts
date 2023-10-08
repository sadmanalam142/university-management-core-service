import { OfferedCourseSection, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IOfferedCourseSectionFilters } from './offeredCourseSection.interface';
import { offeredCourseSectionSearchableFields } from './offeredCourseSection.constant';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const createOfferedCourseSection = async (
  payload: OfferedCourseSection
): Promise<OfferedCourseSection> => {

    const isExistOfferedCourse = await prisma.offeredCourse.findFirst({
        where: {
            id: payload.offeredCourseId
        }
    })

    if(!isExistOfferedCourse){
        throw new ApiError(httpStatus.BAD_REQUEST, "Offered Course does not exist")
    }

    payload.semesterRegistrationId = isExistOfferedCourse.semesterRegistrationId

  const result = prisma.offeredCourseSection.create({
    data: payload,
    include: {
      offeredCourse: {
        include: {
          course: true,
        },
      },
    },
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
