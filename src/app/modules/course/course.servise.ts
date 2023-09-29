import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { ICourseCreateData, ICourseResponseData } from './course.interface';
import { Course } from '@prisma/client';
import { asyncForEach } from '../../../shared/utils';

// kichu bujhi ni... bujchi bt koek ta confusion thaka gece
const createCourse = async (
  payload: ICourseCreateData
): Promise<ICourseCreateData | null> => {
  const { preRequisiteCourses, ...courseData } = payload;

  const newCourse = prisma.$transaction(async transactionClient => {
    const result = await transactionClient.course.create({
      data: courseData,
    });

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
    }

    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      await asyncForEach(
        preRequisiteCourses,
        async (preRequisiteCourse: ICourseResponseData) => {
          await transactionClient.courseToPrerequisite.create({
            data: {
              courseId: result.id,
              preRequisiteId: preRequisiteCourse.courseId,
            },
          });
        }
      );
    }
    return result;
  });
  if (newCourse) {
    const responseData = await prisma.course.findUnique({
      where: {
        id: (await newCourse).id,
      },
      include: {
        preRequisite: {
          include: {
            preRequisite: true,
          },
        },
        preRequisiteFor: {
          include: {
            course: true,
          },
        },
      },
    });
    return responseData;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
};

const updateCourse = async (
  id: string,
  payload: ICourseCreateData
): Promise<Course | null> => {
  const { preRequisiteCourses, ...courseData } = payload;

  await prisma.$transaction(async transactionClient => {
    const result = transactionClient.course.update({
      where: {
        id,
      },
      data: courseData,
    });
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
    }
    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      const deletedPrerequisites = preRequisiteCourses.filter(
        preRequisiteCourse =>
          preRequisiteCourse.courseId && preRequisiteCourse.isDeleted
      );

      const newPrerequisites = preRequisiteCourses.filter(
        preRequisiteCourse =>
          preRequisiteCourse.courseId && !preRequisiteCourse.isDeleted
      );

      await asyncForEach(
        deletedPrerequisites,
        async (deletedPrerequisite: ICourseResponseData) => {
          await transactionClient.courseToPrerequisite.deleteMany({
            where: {
              AND: [
                {
                  courseId: id,
                },
                {
                  preRequisiteId: deletedPrerequisite.courseId,
                },
              ],
            },
          });
        }
      );

      await asyncForEach(
        newPrerequisites,
        async (newPrerequisite: ICourseResponseData) => {
          await transactionClient.courseToPrerequisite.create({
            data: {
              courseId: id,
              preRequisiteId: newPrerequisite.courseId,
            },
          });
        }
      );
    }
    return result;
  });
  const responseData = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
  });
  return responseData;
};

export const CourseService = {
  createCourse,
  updateCourse,
};
