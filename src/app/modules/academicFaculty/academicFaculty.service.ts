import { AcademicFaculty, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IAcademicFacultyFilters } from './academicFaculty.interface';
import { EVENT_ACADEMIC_FACULTY_CREATED, EVENT_ACADEMIC_FACULTY_DELETED, EVENT_ACADEMIC_FACULTY_UPDATED, academicFacultySearchableFields } from './academicFaculty.constant';
import { RedisClient } from '../../../shared/redis';

const createFaculty = async (
  payload: AcademicFaculty
): Promise<AcademicFaculty> => {
  const result = await prisma.academicFaculty.create({
    data: payload
  })

  try {
    if (result) {
      await RedisClient.connect();
      await RedisClient.publish(EVENT_ACADEMIC_FACULTY_CREATED, JSON.stringify(result));
      await RedisClient.disconnect();
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

const getAllFaculties = async (
  filters: IAcademicFacultyFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicFaculty[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: academicFacultySearchableFields.map(field => ({
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
  const whereConditions: Prisma.AcademicFacultyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.academicFaculty.findMany({
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

  const total = await prisma.academicFaculty.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleFaculty = async (
  id: string
): Promise<AcademicFaculty | null> => {
  const result = await prisma.academicFaculty.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateFaculty = async (
  id: string,
  payload: Partial<AcademicFaculty>
): Promise<AcademicFaculty> => {
  const result = await prisma.academicFaculty.update({
    where: {
      id,
    },
    data: payload,
  });

  try {
    if (result) {
      await RedisClient.connect();
      await RedisClient.publish(EVENT_ACADEMIC_FACULTY_UPDATED, JSON.stringify(result));
      await RedisClient.disconnect();
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

const deleteFaculty = async (id: string): Promise<AcademicFaculty> => {
  const result = await prisma.academicFaculty.delete({
    where: {
      id,
    },
  });

  try {
    if (result) {
      await RedisClient.connect();
      await RedisClient.publish(EVENT_ACADEMIC_FACULTY_DELETED, JSON.stringify(result));
      await RedisClient.disconnect();
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

export const AcademicFacultyService = {
  createFaculty,
  getAllFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteFaculty,
};
