import { z } from 'zod';

const createStudentZodSchema = z.object({
  body: z.object({
    studentId: z.string({
      required_error: 'Student id is required',
    }),
    firstName: z.string({
      required_error: 'First name is required',
    }),
    lastName: z.string({
      required_error: 'Last name is required',
    }),
    middleName: z.string({
      required_error: 'Middle name is required',
    }),
    profileImage: z.string().optional(),
    email: z.string({
      required_error: 'Email is required',
    }),
    contactNo: z.string({
      required_error: 'Contact no is required',
    }),
    gender: z.string({
      required_error: 'Gender is required',
    }),
    bloodGroup: z.string({
      required_error: 'Blood group is required',
    })
  }),
});

const updateStudentZodSchema = z.object({
  body: z.object({
    studentId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    middleName: z.string().optional(),
    profileImage: z.string().optional(),
    email: z.string().optional(),
    contactNo: z.string().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional()
  }),
});

export const StudentValidation = {
  createStudentZodSchema,
  updateStudentZodSchema,
};
