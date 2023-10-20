import { OfferedCourse, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import {
  ICreateOfferedCourse,
  IOfferedCourseFilters,
} from './offeredCourse.interface';
import { asyncForEach } from '../../../shared/utils';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { offeredCourseRelationalFields, offeredCourseRelationalFieldsMapper, offeredCourseSearchableFields } from './offeredCourse.constant';
// import { IGenericResponse } from '../../../interfaces/common';
// import { IPaginationOptions } from '../../../interfaces/pagination';
// import { paginationHelpers } from '../../../helpers/paginationHelper';
// import { IAcademicSemesterFilters } from './academicSemester.interface';
// import { academicSemesterSearchableFields } from './academicSemester.constant';

const createOfferedCourse = async (
  payload: ICreateOfferedCourse
): Promise<OfferedCourse[]> => {
  const { academicDepartmentId, semesterRegistrationId, courseIds } = payload;
  const result: OfferedCourse[] = [];
  await asyncForEach(courseIds, async (courseId: string) => {
    const isAlreadyExist = await prisma.offeredCourse.findFirst({
      where: {
        academicDepartmentId,
        semesterRegistrationId,
        courseId,
      },
    });
    if (!isAlreadyExist) {
      const insertOfferedCoures = await prisma.offeredCourse.create({
        data: {
          academicDepartmentId,
          semesterRegistrationId,
          courseId,
        },
        include: {
          academicDepartment: true,
          semesterRegistration: true,
          course: true,
        },
      });
      result.push(insertOfferedCoures);
    }
  });
  return result;
};

const getAllOfferedCourses = async (
  filters: IOfferedCourseFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<OfferedCourse[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
        OR: offeredCourseSearchableFields.map((field) => ({
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
            if (offeredCourseRelationalFields.includes(key)) {
                return {
                    [offeredCourseRelationalFieldsMapper[key]]: {
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

  const whereConditions: Prisma.OfferedCourseWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.offeredCourse.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true,
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

  const total = await prisma.offeredCourse.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSinglOfferedCourse = async (
  id: string
): Promise<OfferedCourse | null> => {
  const result = await prisma.offeredCourse.findUnique({
    where: {
      id,
    },
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true,
    },
  });
  return result;
};

const updatOfferedCourse = async (
  id: string,
  payload: Partial<OfferedCourse>
): Promise<OfferedCourse> => {
  const result = await prisma.offeredCourse.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true,
    },
  });
  return result;
};

const deleteOfferedCourse = async (id: string): Promise<OfferedCourse> => {
  const result = await prisma.offeredCourse.delete({
    where: {
      id,
    },
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true,
    },
  });
  return result;
};

export const OfferedCourseService = {
  createOfferedCourse,
  getAllOfferedCourses,
  getSinglOfferedCourse,
  updatOfferedCourse,
  deleteOfferedCourse,
};
