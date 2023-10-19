import { AcademicSemester, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IAcademicSemesterFilters } from './academicSemester.interface';
import { EVENT_ACADEMIC_SEMESTER_CREATED, EVENT_ACADEMIC_SEMESTER_DELETED, EVENT_ACADEMIC_SEMESTER_UPDATED, academicSemesterSearchableFields, academicSemesterTitleCodeMapper } from './academicSemester.constant';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { RedisClient } from '../../../shared/redis';

const createSemester = async (
  payload: AcademicSemester
): Promise<AcademicSemester> => {
  if (academicSemesterTitleCodeMapper[payload.title] !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Semester Code!');
  }
  const result = await prisma.academicSemester.create({
    data: payload
  })

  try {
    if (result) {
      await RedisClient.publish(EVENT_ACADEMIC_SEMESTER_CREATED, JSON.stringify(result));
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }
  return result;
};

const getAllSemesters = async (
  filters: IAcademicSemesterFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicSemester[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: academicSemesterSearchableFields.map(field => ({
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
  const whereConditions: Prisma.AcademicSemesterWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.academicSemester.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.academicSemester.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleSemester = async (
  id: string
): Promise<AcademicSemester | null> => {
  const result = await prisma.academicSemester.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateSemester = async (
  id: string,
  payload: Partial<AcademicSemester>
): Promise<AcademicSemester> => {
  const result = await prisma.academicSemester.update({
    where: {
      id,
    },
    data: payload
  });

  try {
    if (result) {
      await RedisClient.publish(EVENT_ACADEMIC_SEMESTER_UPDATED, JSON.stringify(result));
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

const deleteSemester = async (
    id: string
  ): Promise<AcademicSemester> => {
    const result = await prisma.academicSemester.delete({
      where: {
        id,
      },
    });

    try {
      if (result) {
        await RedisClient.publish(EVENT_ACADEMIC_SEMESTER_DELETED, JSON.stringify(result));
      }
    } catch (error) {
      console.error('Error publishing to Redis:', error);
    }

    return result;
  };

export const AcademicSemesterService = {
  createSemester,
  getAllSemesters,
  getSingleSemester,
  updateSemester,
  deleteSemester
};
