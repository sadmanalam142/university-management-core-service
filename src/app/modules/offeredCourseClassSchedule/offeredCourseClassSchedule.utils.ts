import { OfferedCourseClassSchedule } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { hasTimeConflict } from "../../../shared/utils";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const checkRoomAvailable = async (payload: OfferedCourseClassSchedule) => {
  const alreadyBookedRoomOnDay =
    await prisma.offeredCourseClassSchedule.findMany({
      where: {
        dayOfWeek: payload.dayOfWeek,
        room: {
          id: payload.roomId,
        },
      },
    });

  const existingSlots = alreadyBookedRoomOnDay.map(schedule => ({
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    dayOfWeek: schedule.dayOfWeek,
  }));

  const newSlot = {
    startTime: payload.startTime,
    endTime: payload.endTime,
    dayOfWeek: payload.dayOfWeek,
  };

  if (hasTimeConflict(existingSlots, newSlot)) {
    throw new ApiError(httpStatus.CONFLICT, 'Room is already booked');
  }
};

const checkFacultyAvailable = async (payload: OfferedCourseClassSchedule) => {
    const alreadyFcultyAssigned = await prisma.offeredCourseClassSchedule.findMany({
        where: {
            dayOfWeek: payload.dayOfWeek,
            faculty: {
                id: payload.facultyId
            }
        }
    })

    const existingSlots = alreadyFcultyAssigned.map((schedule) => ({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        dayOfWeek: schedule.dayOfWeek
    }))


    const newSlot = {
        startTime: payload.startTime,
        endTime: payload.endTime,
        dayOfWeek: payload.dayOfWeek
    }

    if (hasTimeConflict(existingSlots, newSlot)) {
        throw new ApiError(httpStatus.CONFLICT, "Faculty is already booked!")
    }
}

export const OfferedCourseClassScheduleUtils = {
    checkRoomAvailable,
    checkFacultyAvailable
}
