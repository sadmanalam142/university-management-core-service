import { z } from "zod";

const createOfferedCourseSectionZodValidation = z.object({
    body: z.object({
        offeredCourseId: z.string({
            required_error: 'Offered course id is required'
        }),
        maxCapacity: z.number({
            required_error: 'Max capacity is required'
        }),
        title: z.string({
            required_error: 'Title is required'
        })
    })
})

const updateOfferedCourseSectionZodValidation = z.object({
    body: z.object({
        maxCapacity: z.number().optional(),
        title: z.string().optional()
    })
});

export const OfferedCourseSectionValidation = {
    createOfferedCourseSectionZodValidation,
    updateOfferedCourseSectionZodValidation
}