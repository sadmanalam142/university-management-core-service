import { z } from "zod";
import { daysInWeek } from "../offeredCourseSection/offeredCourseSection.constant";

const timeStringSchema = z.string().refine(
    (time) => {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        // example: 09:45, 21:30
        return regex.test(time);
    },
    {
        message: "Invalid time format, expected 'HH:MM' in 24-hour format"
    }
);

const createOfferedCourseClassScheduleZodValidation = z
.object({
    body: z.object({
        dayOfWeek: z.enum([...daysInWeek] as [string, ...string[]], {
            required_error: 'Day of week is required'
        }),
        startTime: timeStringSchema,
        endTime: timeStringSchema,
        roomId: z.string({
            required_error: 'Room id is required'
        }),
        facultyId: z.string({
            required_error: 'Faculty id is required'
        }),
        offeredCourseSectionId: z.string({
            required_error: 'Section id is required'
        })
    })
})
.refine(
    ({ body }) => {
        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);

        return start < end;
    },
    {
        message: 'Start time must be before end time'
    }
);

const updateOfferedCourseClassScheduleZodValidation = z.object({
    body: z.object({
        semesterRegistrationId: z.string().optional(),
        courseId: z.string().optional(),
        academicDepartmentId: z.string().optional()
    })
});

export const OfferedCourseClassScheduleValidation = {
    createOfferedCourseClassScheduleZodValidation,
    updateOfferedCourseClassScheduleZodValidation
}

// concept not cleared