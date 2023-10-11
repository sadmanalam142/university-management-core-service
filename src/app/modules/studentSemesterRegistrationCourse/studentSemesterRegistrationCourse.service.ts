import { SemesterRegistrationStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IEnrollCoursePayload } from "../semesterRegistration/semesterRegistration.interface";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const enrollIntoCourse = async (
    authId: string,
    payload: IEnrollCoursePayload
  ): Promise<{
    message: string;
  }> => {
    const studentInfo = await prisma.student.findFirst({
      where: {
        studentId: authId,
      },
    });
  
    const semesterRegistrationInfo = await prisma.semesterRegistration.findFirst({
      where: {
        status: SemesterRegistrationStatus.ONGOING,
      },
    });
  
    const offeredCourse = await prisma.offeredCourse.findFirst({
      where: {
        id: payload.offeredCourseId,
      },
      include: {
        course: true,
      },
    });
  
    const offeredCourseSection = await prisma.offeredCourseSection.findFirst({
      where: {
        id: payload.offeredCourseSectionId,
      },
    });
  
    if (!studentInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student not found!');
    }
  
    if (!semesterRegistrationInfo) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Semester Registration not found!'
      );
    }
    if (!offeredCourse) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Offered Course not found!');
    }
    if (!offeredCourseSection) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Offered Course Section not found!'
      );
    }
    if (
      offeredCourseSection.maxCapacity &&
      offeredCourseSection.currentlyEnrolledStudent &&
      offeredCourseSection.currentlyEnrolledStudent >=
        offeredCourseSection.maxCapacity
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Student capacity is full!');
    }
  
    await prisma.$transaction(async transactionClient => {
      await transactionClient.studentSemesterRegistrationCourse.create({
        data: {
          studentId: studentInfo?.id,
          semesterRegistrationId: semesterRegistrationInfo?.id,
          offeredCourseId: payload.offeredCourseId,
          offeredCourseSectionId: payload.offeredCourseSectionId,
        },
      });
  
      await transactionClient.offeredCourseSection.update({
        where: {
          id: payload.offeredCourseSectionId,
        },
        data: {
          currentlyEnrolledStudent: {
            increment: 1,
          },
        },
      });
  
      await transactionClient.studentSemesterRegistration.updateMany({
        where: {
          student: {
            id: studentInfo?.id,
          },
          semesterRegistration: {
            id: semesterRegistrationInfo?.id,
          },
        },
        data: {
          totalCreditsTaken: {
            increment: offeredCourse.course.credits,
          },
        },
      });
    });
  
    return {
      message: 'Enrollment Successfull',
    };
  };
  
  const withdrawFromCourse = async (
    authId: string,
    payload: IEnrollCoursePayload
  ): Promise<{
    message: string;
  }> => {
    const studentInfo = await prisma.student.findFirst({
      where: {
        studentId: authId,
      },
    });
  
    const semesterRegistrationInfo = await prisma.semesterRegistration.findFirst({
      where: {
        status: SemesterRegistrationStatus.ONGOING,
      },
    });
  
    const offeredCourse = await prisma.offeredCourse.findFirst({
      where: {
        id: payload.offeredCourseId,
      },
      include: {
        course: true,
      },
    });
  
    if (!studentInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Student not found!');
    }
  
    if (!semesterRegistrationInfo) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Semester Registration not found!'
      );
    }
    if (!offeredCourse) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Offered Course not found!');
    }
  
    await prisma.$transaction(async transactionClient => {
      await transactionClient.studentSemesterRegistrationCourse.delete({
        where: {
          semesterRegistrationId_studentId_offeredCourseId: {
            studentId: studentInfo?.id,
            semesterRegistrationId: semesterRegistrationInfo?.id,
            offeredCourseId: payload.offeredCourseId,
          },
        },
      });
  
      await transactionClient.offeredCourseSection.update({
        where: {
          id: payload.offeredCourseSectionId,
        },
        data: {
          currentlyEnrolledStudent: {
            decrement: 1,
          },
        },
      });
  
      await transactionClient.studentSemesterRegistration.updateMany({
        where: {
          student: {
            id: studentInfo?.id,
          },
          semesterRegistration: {
            id: semesterRegistrationInfo?.id,
          },
        },
        data: {
          totalCreditsTaken: {
            decrement: offeredCourse.course.credits,
          },
        },
      });
    });
  
    return {
      message: 'Withdraw Successfull',
    };
  };

  export const studentSemesterRegistrationCourseService = {
    enrollIntoCourse,
    withdrawFromCourse
  }