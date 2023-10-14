import { ExamType, PrismaClient, StudentEnrolledCourseStatus } from "@prisma/client"
import { DefaultArgs, PrismaClientOptions } from "@prisma/client/runtime/library"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiError"
import httpStatus from "http-status"
import { StudentEnrolledCourseMarkUtils } from "./studentEnrolledCourseMark.utils"
import { IUpdateStudentCourseFinalMarksPayload, IUpdateStudentMarksPayload } from "./StudentEnrolledCourseMark.interface"

const createStudentEnrolledCourseDefaultMark = async (
    prismaClient: Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
    payload: {
        studentId: string,
        studentEnrolledCourseId: string,
        academicSemesterId: string
    }
) => {
    const isExitMidtermData = await prismaClient.studentEnrolledCourseMark.findFirst({
        where: {
            examType: ExamType.MIDTERM,
            student: {
                id: payload.studentId
            },
            studentEnrolledCourse: {
                id: payload.studentEnrolledCourseId
            },
            academicSemester: {
                id: payload.academicSemesterId
            }
        }
    })
    if (!isExitMidtermData) {
        await prismaClient.studentEnrolledCourseMark.create({
            data: {
                student: {
                    connect: {
                        id: payload.studentId
                    }
                },
                studentEnrolledCourse: {
                    connect: {
                        id: payload.studentEnrolledCourseId
                    }
                },
                academicSemester: {
                    connect: {
                        id: payload.academicSemesterId
                    }
                },
                examType: ExamType.MIDTERM
            }
        })
    }

    const isExistFinalData = await prismaClient.studentEnrolledCourseMark.findFirst({
        where: {
            examType: ExamType.FINAL,
            student: {
                id: payload.studentId
            },
            studentEnrolledCourse: {
                id: payload.studentEnrolledCourseId
            },
            academicSemester: {
                id: payload.academicSemesterId
            }
        }
    })

    if (!isExistFinalData) {
        await prismaClient.studentEnrolledCourseMark.create({
            data: {
                student: {
                    connect: {
                        id: payload.studentId
                    }
                },
                studentEnrolledCourse: {
                    connect: {
                        id: payload.studentEnrolledCourseId
                    }
                },
                academicSemester: {
                    connect: {
                        id: payload.academicSemesterId
                    }
                },
                examType: ExamType.FINAL
            }
        })
    }
}

const updateStudentMarks = async (payload: IUpdateStudentMarksPayload) => {
    const { studentId, academicSemesterId, courseId, examType, marks } = payload;

    const studentEnrolledCourseMarks = await prisma.studentEnrolledCourseMark.findFirst({
        where: {
            student: {
                id: studentId
            },
            academicSemester: {
                id: academicSemesterId
            },
            studentEnrolledCourse: {
                course: {
                    id: courseId
                }
            },
            examType
        }
    })

    if (!studentEnrolledCourseMarks) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Student enrolled course mark not found!")
    }
    const result = StudentEnrolledCourseMarkUtils.getGradeFromMarks(marks)

    const updateStudentMarks = await prisma.studentEnrolledCourseMark.update({
        where: {
            id: studentEnrolledCourseMarks.id
        },
        data: {
            marks,
            grade: result.grade
        }
    })

    return updateStudentMarks;
}

const updateFinalMarks = async (payload: IUpdateStudentCourseFinalMarksPayload) => {
    const { studentId, academicSemesterId, courseId } = payload;
    const studentEnrolledCourse = await prisma.studentEnrolledCourse.findFirst({
        where: {
            student: {
                id: studentId
            },
            academicSemester: {
                id: academicSemesterId
            },
            course: {
                id: courseId
            }
        }
    });

    if (!studentEnrolledCourse) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Student enrolled course data not found!")
    }

    const studentEnrolledCourseMarks = await prisma.studentEnrolledCourseMark.findMany({
        where: {
            student: {
                id: studentId
            },
            academicSemester: {
                id: academicSemesterId
            },
            studentEnrolledCourse: {
                course: {
                    id: courseId
                }
            }
        }
    });

    if (!studentEnrolledCourseMarks.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, "student enrolled course mark not found!")
    }

    const midTermMarks = studentEnrolledCourseMarks.find((item) => item.examType === ExamType.MIDTERM)?.marks || 0;
    const finalTermMarks = studentEnrolledCourseMarks.find((item) => item.examType === ExamType.FINAL)?.marks || 0;

    const totalFinalMarks = Math.ceil(midTermMarks * 0.4) + Math.ceil(finalTermMarks * 0.6);
    const result = StudentEnrolledCourseMarkUtils.getGradeFromMarks(totalFinalMarks)


    await prisma.studentEnrolledCourse.updateMany({
        where: {
            student: {
                id: studentId
            },
            academicSemester: {
                id: academicSemesterId
            },
            course: {
                id: courseId
            }
        },
        data: {
            grade: result.grade,
            point: result.point,
            totalMarks: totalFinalMarks,
            status: StudentEnrolledCourseStatus.COMPLETED
        }
    });

    const grades = await prisma.studentEnrolledCourse.findMany({
        where: {
            student: {
                id: studentId
            },
            status: StudentEnrolledCourseStatus.COMPLETED
        },
        include: {
            course: true
        }
    });

    const academicResult = await StudentEnrolledCourseMarkUtils.calcCGPAandGrade(grades);

    const studentAcademicInfo = await prisma.studentAcademicInfo.findFirst({
        where: {
            student: {
                id: studentId
            }
        }
    })

    if (studentAcademicInfo) {
        await prisma.studentAcademicInfo.update({
            where: {
                id: studentAcademicInfo.id
            },
            data: {
                totalCompletedCredit: academicResult.totalCompletedCredit,
                cgpa: academicResult.cgpa
            }
        })
    }
    else {
        await prisma.studentAcademicInfo.create({
            data: {
                student: {
                    connect: {
                        id: studentId
                    }
                },
                totalCompletedCredit: academicResult.totalCompletedCredit,
                cgpa: academicResult.cgpa
            }
        })
    }

    return grades;
};

export const StudentEnrolledCourseMarkService = {
    createStudentEnrolledCourseDefaultMark,
    updateStudentMarks,
    updateFinalMarks
}