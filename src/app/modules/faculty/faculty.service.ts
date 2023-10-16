import { CourseFaculty, Faculty, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { facultySearchableFields } from './faculty.constant';
import { IFacultyFilterRequest } from './faculty.interface';

const createFaculty = async (payload: Faculty): Promise<Faculty> => {
  const result = await prisma.faculty.create({
    data: payload,
    include: {
      academicFaculty: true,
      academicDepartment: true,
    },
  });
  return result;
};

const getAllFaculties = async (
  filters: IFacultyFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Faculty[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: facultySearchableFields.map(field => ({
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
  const whereConditions: Prisma.FacultyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.faculty.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
      academicFaculty: true,
      academicDepartment: true,
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

  const total = await prisma.faculty.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleFaculty = async (id: string): Promise<Faculty | null> => {
  const result = await prisma.faculty.findUnique({
    where: {
      id,
    },
    include: {
      academicFaculty: true,
      academicDepartment: true,
    },
  });
  return result;
};

const updateFaculty = async (
  id: string,
  payload: Partial<Faculty>
): Promise<Faculty> => {
  const result = await prisma.faculty.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicFaculty: true,
      academicDepartment: true,
    },
  });
  return result;
};

const deleteFaculty = async (id: string): Promise<Faculty> => {
  const result = await prisma.faculty.delete({
    where: {
      id,
    },
    include: {
      academicFaculty: true,
      academicDepartment: true,
    },
  });
  return result;
};

const assignCourses = async (
  id: string,
  payload: string[]
): Promise<CourseFaculty[]> => {
  await prisma.courseFaculty.createMany({
    data: payload.map(courseId => ({
      facultyId: id,
      courseId: courseId,
    })),
  });

  const assignCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id,
    },
    include: {
      course: true,
    },
  });

  return assignCoursesData;
};

const removeCourses = async (
  id: string,
  payload: string[]
): Promise<CourseFaculty[]> => {
  await prisma.courseFaculty.deleteMany({
    where: {
      facultyId: id,
      courseId: {
        in: payload
      }
    }
  });

  const remainCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id,
    },
    include: {
      course: true,
    },
  });

  return remainCoursesData;
};

const getMyCourses = async (
  authUser: {
      userId: string,
      role: string
  },
  filters: {
      academicSemesterId?: string | null | undefined,
      courseId?: string | null | undefined
  }
) => {
  if (!filters.academicSemesterId) {
      const currentSemester = await prisma.academicSemester.findFirst({
          where: {
              isCurrent: true
          }
      });

      filters.academicSemesterId = currentSemester?.id
  }

  const offeredCourseSections = await prisma.offeredCourseSection.findMany({
      where: {
          offeredCourseClassSchedules: {
              some: {
                  faculty: {
                      facultyId: authUser.userId
                  }
              }
          },
          offeredCourse: {
              semesterRegistration: {
                  academicSemester: {
                      id: filters.academicSemesterId
                  }
              }
          }
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
                  }
              }
          }
      }
  });

  const couseAndSchedule = offeredCourseSections.reduce((acc: any, obj: any) => {

      const course = obj.offeredCourse.course;
      const classSchedules = obj.offeredCourseClassSchedules

      const existingCourse = acc.find((item: any) => item.couse?.id === course?.id);
      if (existingCourse) {
          existingCourse.sections.push({
              section: obj,
              classSchedules
          })
      }
      else {
          acc.push({
              course,
              sections: [
                  {
                      section: obj,
                      classSchedules
                  }
              ]
          })
      }
      return acc;
  }, []);

  return couseAndSchedule;
};

export const FacultyService = {
  createFaculty,
  getAllFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteFaculty,
  assignCourses,
  removeCourses,
  getMyCourses
};
