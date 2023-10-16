import {
  Course,
  OfferedCourse,
  Prisma,
  SemesterRegistration,
  SemesterRegistrationStatus,
  Student,
  StudentEnrolledCourseStatus,
  StudentSemesterRegistration,
  StudentSemesterRegistrationCourse,
} from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import {
  IEnrollCoursePayload,
  ISemesterRegistrationFilters,
} from './semesterRegistration.interface';
import { semesterRegistrationSearchableFields } from './semesterRegistration.contant';
import { studentSemesterRegistrationCourseService } from '../studentSemesterRegistrationCourse/studentSemesterRegistrationCourse.service';
import { asyncForEach } from '../../../shared/utils';
import { StudentSemesterPaymentService } from '../studentSemesterPayment/studentSemesterPayment.service';
import { StudentEnrolledCourseMarkService } from '../studentEnrolledCourseMark/studentEnrolledCourseMark.service';
import { SemesterRegistrationUtils } from './semesterRegistration.utils';

const createSemesterRegistration = async (
  payload: SemesterRegistration
): Promise<SemesterRegistration> => {
  // const isAnySemesterRegUpcomingOrOngoing =
  //   await prisma.semesterRegistration.findFirst({
  //     where: {
  //       OR: [
  //         {
  //           status: SemesterRegistrationStatus.UPCOMING,
  //         },
  //         {
  //           status: SemesterRegistrationStatus.ONGOING,
  //         },
  //       ],
  //     },
  //   });

  // if (isAnySemesterRegUpcomingOrOngoing) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     `There is already an ${isAnySemesterRegUpcomingOrOngoing.status} registration`
  //   );
  // }
  const result = await prisma.semesterRegistration.create({
    data: payload,
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const getAllSemesterRegistrations = async (
  filters: ISemesterRegistrationFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<SemesterRegistration[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filtersData } = filters;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      OR: semesterRegistrationSearchableFields.map(field => ({
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
  const whereConditions: Prisma.SemesterRegistrationWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.semesterRegistration.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
      academicSemester: true,
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

  const total = await prisma.semesterRegistration.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleSemesterRegistration = async (
  id: string
): Promise<SemesterRegistration | null> => {
  const result = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const updateSemesterRegistration = async (
  id: string,
  payload: Partial<SemesterRegistration>
): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Data does not exist');
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.UPCOMING &&
    payload.status !== SemesterRegistrationStatus.ONGOING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move to UPCOMING to ONGOING'
    );
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.ONGOING &&
    payload.status !== SemesterRegistrationStatus.ENDED
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move to ONGOING to ENDED'
    );
  }

  const result = await prisma.semesterRegistration.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const deleteSemesterRegistration = async (
  id: string
): Promise<SemesterRegistration> => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const createStartRegistration = async (
  authId: string
): Promise<{
  studentRegistration: StudentSemesterRegistration | null;
  student: Student | null;
  semesterRegistration: SemesterRegistration | null;
}> => {
  const studentInfo = await prisma.student.findFirst({
    where: {
      studentId: authId,
    },
  });

  if (!studentInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student Info not found');
  }

  const semesterRegistrationInfo = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.UPCOMING,
          SemesterRegistrationStatus.ONGOING,
        ],
      },
    },
  });

  if (
    semesterRegistrationInfo?.status === SemesterRegistrationStatus.UPCOMING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Registration is not started yet'
    );
  }

  let studentRegistration = await prisma.studentSemesterRegistration.findFirst({
    where: {
      student: {
        id: studentInfo?.id,
      },
      semesterRegistration: {
        id: semesterRegistrationInfo?.id,
      },
    },
  });

  if (!studentRegistration) {
    studentRegistration = await prisma.studentSemesterRegistration.create({
      data: {
        student: {
          connect: {
            id: studentInfo?.id,
          },
        },
        semesterRegistration: {
          connect: {
            id: semesterRegistrationInfo?.id,
          },
        },
      },
    });
  }
  return {
    studentRegistration,
    student: studentInfo,
    semesterRegistration: semesterRegistrationInfo,
  };
};

const enrollIntoCourse = async (
  authId: string,
  payload: IEnrollCoursePayload
): Promise<{
  message: string;
}> => {
  return studentSemesterRegistrationCourseService.enrollIntoCourse(authId, payload)
};

const withdrawFromCourse = async (
  authId: string,
  payload: IEnrollCoursePayload
): Promise<{
  message: string;
}> => {
  return studentSemesterRegistrationCourseService.withdrawFromCourse(authId, payload)
};

const confirmRegistration = async (authUserId: string): Promise<{ message: string }> => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
      where: {
          status: SemesterRegistrationStatus.ONGOING
      }
  })

  // 3 - 6
  const studentSemesterRegistration = await prisma.studentSemesterRegistration.findFirst({
      where: {
          semesterRegistration: {
              id: semesterRegistration?.id
          },
          student: {
              studentId: authUserId
          }
      }
  })

  if (!studentSemesterRegistration) {
      throw new ApiError(httpStatus.BAD_REQUEST, "You are not recognized for this semester!")
  }

  if (studentSemesterRegistration.totalCreditsTaken === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "You are not enrolled in any course!")
  }

  if (
      studentSemesterRegistration.totalCreditsTaken &&
      semesterRegistration?.minCredit &&
      semesterRegistration.maxCredit &&
      (studentSemesterRegistration.totalCreditsTaken < semesterRegistration?.minCredit ||
          studentSemesterRegistration.totalCreditsTaken > semesterRegistration?.maxCredit)
  ) {
      throw new ApiError(httpStatus.BAD_REQUEST, `You can take only ${semesterRegistration.minCredit} to ${semesterRegistration.maxCredit} credits`)
  }

  await prisma.studentSemesterRegistration.update({
      where: {
          id: studentSemesterRegistration.id
      },
      data: {
          isConfirmed: true
      }
  })
  return {
      message: "Your registration is confirmed!"
  }

}

const getRegistrations = async (authUserId: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
      where: {
          status: SemesterRegistrationStatus.ONGOING
      },
      include: {
          academicSemester: true
      }
  })

  const studentSemesterRegistration = await prisma.studentSemesterRegistration.findFirst({
      where: {
          semesterRegistration: {
              id: semesterRegistration?.id
          },
          student: {
              studentId: authUserId
          }
      },
      include: {
          student: true
      }
  })

  return { semesterRegistration, studentSemesterRegistration }
}

const startNewSemester = async (
  id: string
): Promise<{
  message: string
}> => {
  const semesterRegistration = await prisma.semesterRegistration.findUnique({
      where: {
          id
      },
      include: {
          academicSemester: true
      }
  });

  if (!semesterRegistration) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Semester Registration Not found!");
  }

  if (semesterRegistration.status !== SemesterRegistrationStatus.ENDED) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Semester Registration is not ended yet!");
  }

  if (semesterRegistration.academicSemester.isCurrent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Semester is already started!")
  }

  await prisma.$transaction(async (prismaTransactionClient) => {
      await prismaTransactionClient.academicSemester.updateMany({
          where: {
              isCurrent: true
          },
          data: {
              isCurrent: false
          }
      });

      await prismaTransactionClient.academicSemester.update({
          where: {
              id: semesterRegistration.academicSemesterId
          },
          data: {
              isCurrent: true
          }
      });

      const studentSemesterRegistrations = await prisma.studentSemesterRegistration.findMany({
          where: {
              semesterRegistration: {
                  id
              },
              isConfirmed: true
          }
      });

      await asyncForEach(
          studentSemesterRegistrations,
          async (studentSemReg: StudentSemesterRegistration) => {
              if (studentSemReg.totalCreditsTaken) {
                  const totalSemesterPaymentAmount = studentSemReg.totalCreditsTaken * 5000;

                  await StudentSemesterPaymentService.createSemesterPayment(prismaTransactionClient, {
                      studentId: studentSemReg.studentId,
                      academicSemesterId: semesterRegistration.academicSemesterId,
                      totalPaymentAmount: totalSemesterPaymentAmount
                  });
              }
              const studentSemesterRegistrationCourses =
                  await prismaTransactionClient.studentSemesterRegistrationCourse.findMany({
                      where: {
                          semesterRegistration: {
                              id
                          },
                          student: {
                              id: studentSemReg.studentId
                          }
                      },
                      include: {
                          offeredCourse: {
                              include: {
                                  course: true
                              }
                          }
                      }
                  });
              await asyncForEach(
                  studentSemesterRegistrationCourses,
                  async (
                      item: StudentSemesterRegistrationCourse & {
                          offeredCourse: OfferedCourse & {
                              course: Course;
                          };
                      }
                  ) => {

                      const isExistEnrolledData = await prismaTransactionClient.studentEnrolledCourse.findFirst({
                          where: {
                              student: { id: item.studentId },
                              course: { id: item.offeredCourse.courseId },
                              academicSemester: { id: semesterRegistration.academicSemesterId }
                          }
                      });

                      if (!isExistEnrolledData) {
                          const enrolledCourseData = {
                              studentId: item.studentId,
                              courseId: item.offeredCourse.courseId,
                              academicSemesterId: semesterRegistration.academicSemesterId
                          }

                          const studentEnrolledCourseData = await prismaTransactionClient.studentEnrolledCourse.create({
                              data: enrolledCourseData
                          });

                          await StudentEnrolledCourseMarkService.createStudentEnrolledCourseDefaultMark(prismaTransactionClient, {
                              studentId: item.studentId,
                              studentEnrolledCourseId: studentEnrolledCourseData.id,
                              academicSemesterId: semesterRegistration.academicSemesterId
                          })

                      }

                  }
              )
          }

      )
  })


  return {
      message: "Semester started successfully!"
  }
}

const getMySemesterRegCouses = async (
  authUserId: string
) => {
  const student = await prisma.student.findFirst({
      where: {
          studentId: authUserId
      }
  });

  //console.log(student);

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
      where: {
          status: {
              in: [SemesterRegistrationStatus.UPCOMING, SemesterRegistrationStatus.ONGOING]
          }
      },
      include: {
          academicSemester: true
      }
  });
  console.log(semesterRegistration)

  if (!semesterRegistration) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No semester registration not found!")
  }

  const studentCompletedCourse = await prisma.studentEnrolledCourse.findMany({
      where: {
          status: StudentEnrolledCourseStatus.COMPLETED,
          student: {
              id: student?.id
          }
      },
      include: {
          course: true
      }
  });

  const studentCurrentSemesterTakenCourse = await prisma.studentSemesterRegistrationCourse.findMany({
      where: {
          student: {
              id: student?.id
          },
          semesterRegistration: {
              id: semesterRegistration?.id
          }
      },
      include: {
          offeredCourse: true,
          offeredCourseSection: true
      }
  });
  console.log(studentCurrentSemesterTakenCourse)

  const offeredCourse = await prisma.offeredCourse.findMany({
      where: {
          semesterRegistration: {
              id: semesterRegistration.id
          },
          academicDepartment: {
              id: student?.academicDepartmentId
          }
      },
      include: {
          course: {
              include: {
                  preRequisite: {
                      include: {
                          preRequisite: true
                      }
                  }
              }
          },
          offeredCourseSections: {
              include: {
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
          }
      }
  });

  const availableCourses = SemesterRegistrationUtils.getAvailableCourses(offeredCourse, studentCompletedCourse, studentCurrentSemesterTakenCourse);
  return availableCourses;
}

export const SemesterRagistrationService = {
  createSemesterRegistration,
  getAllSemesterRegistrations,
  getSingleSemesterRegistration,
  updateSemesterRegistration,
  deleteSemesterRegistration,
  createStartRegistration,
  enrollIntoCourse,
  withdrawFromCourse,
  confirmRegistration,
  getRegistrations,
  startNewSemester,
  getMySemesterRegCouses
};
