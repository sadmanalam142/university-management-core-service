export type ICreateOfferedCourse = {
    academicDepartmentId: string;
    semesterRegistrationId: string;
    courseIds: string[]
}

export type IOfferedCourseFilters = {
    searchTerm?: string | undefined;
    semesterRegistrationId?: string | undefined;
    courseId?: string | undefined;
    academicDepartmentId?: string | undefined;
}