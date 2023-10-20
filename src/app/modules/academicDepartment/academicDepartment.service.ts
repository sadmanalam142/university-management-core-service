import { AcademicDepartment, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IAcademicDepartmentFilters } from './academicDepartment.interface';
import { EVENT_ACADEMIC_DEPARTMENT_CREATED, EVENT_ACADEMIC_DEPARTMENT_DELETED, EVENT_ACADEMIC_DEPARTMENT_UPDATED, academicDepartmentRelationalFields, academicDepartmentRelationalFieldsMapper, academicDepartmentSearchableFields } from './academicDepartment.constant';
import { RedisClient } from '../../../shared/redis';

const createDepartment = async (
  payload: AcademicDepartment
): Promise<AcademicDepartment> => {
  const result = await prisma.academicDepartment.create({
    data: payload,
    include: {
      academicFaculty: true,
    },
  });

  try {
    if (result) {
      await RedisClient.connect();
      await RedisClient.publish(EVENT_ACADEMIC_DEPARTMENT_CREATED, JSON.stringify(result));
      await RedisClient.disconnect();
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

const getAllDepartments = async (
  filters: IAcademicDepartmentFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicDepartment[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
        OR: academicDepartmentSearchableFields.map((field) => ({
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
            if (academicDepartmentRelationalFields.includes(key)) {
                return {
                    [academicDepartmentRelationalFieldsMapper[key]]: {
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

  const whereConditions: Prisma.AcademicDepartmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.academicDepartment.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
      academicFaculty: true,
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

  const total = await prisma.academicDepartment.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleDepartment = async (
  id: string
): Promise<AcademicDepartment | null> => {
  const result = await prisma.academicDepartment.findUnique({
    where: {
      id,
    },
    include: {
      academicFaculty: true,
    },
  });
  return result;
};

const updateDepartment = async (
  id: string,
  payload: Partial<AcademicDepartment>
): Promise<AcademicDepartment> => {
  const result = await prisma.academicDepartment.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicFaculty: true,
    },
  });

  try {
    if (result) {
      await RedisClient.connect();
      await RedisClient.publish(EVENT_ACADEMIC_DEPARTMENT_UPDATED, JSON.stringify(result));
      await RedisClient.disconnect();
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

const deleteDepartment = async (id: string): Promise<AcademicDepartment> => {
  const result = await prisma.academicDepartment.delete({
    where: {
      id,
    },
    include: {
      academicFaculty: true,
    },
  });
  
  try {
    if (result) {
      await RedisClient.connect();
      await RedisClient.publish(EVENT_ACADEMIC_DEPARTMENT_DELETED, JSON.stringify(result));
      await RedisClient.disconnect();
    }
  } catch (error) {
    console.error('Error publishing to Redis:', error);
  }

  return result;
};

export const AcademicDepartmentService = {
  createDepartment,
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
};
